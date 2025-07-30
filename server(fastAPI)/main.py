import uvicorn
from typing import Annotated
from fastapi import FastAPI, Body #Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from datetime import datetime

import urllib.parse, base64, os, requests
#from fastapi.requests import Request #TODO check

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-library-read user-top-read'

frontendURL='http://localhost:5137'
REDIRECT_URI = 'http://127.0.0.1:5000/callback'  

app = FastAPI()

origins = [
    "https://localhost:5137",
    "http://localhost:5137",

    "http://127.0.0.1:5137",
    "https://127.0.0.1:5137",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)





#   ---   helper functions   ---



#checks access token expirery in evironment variabes
    #true if expiry time is valid
def checkAccessToken():
    if os.getenv('Expire_Time'):
        rawExp = os.getenv('Expire_Time')
        print('env: ', rawExp)
        accessTokenTime = datetime.fromisoformat(rawExp)
        
        print('Exp(check): ',accessTokenTime)
        print('Now(check): ', datetime.fromtimestamp(datetime.now().timestamp()))
        print("valid: " , accessTokenTime >= datetime.now() )
        # return True
        return accessTokenTime >= datetime.now()
    else:
        return False

#sets environ valraibles form contianer secrets 
    #returns true on success
def setSecrets():
    f = open('/run/secrets/spotifyCred')
    if f:
        data = f.read().split('\n')
        # print('secrets: ', data)
        os.environ['client_id'] = data[0].split(" = ")[1]
        os.environ['client_secret'] = data[1].split(" = ")[1]
    #not needed? initialized on callback
        # os.environ['Access_Token'] = data[3].split("=")[1]
        # os.environ['Refresh_Token'] = data[4].split(" = ")[1]
        # os.environ['Expire_Time'] = data[5].split(" = ")[1]
        return True
    else:
        print('file error') 
        return False

#refreshes access token
    #True on Success
def refreshToken():
    if os.getenv('Refresh_Token'): # can be refreshed 
        if not checkAccessToken(): # needed? double checks if accessToken valid
            response = requests.post(
                TOKEN_URL, 
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token':os.getenv('Refresh_Token'),
                    'client_id': os.getenv("client_id"),
                    'client_secret': os.getenv("client_secret")
                }, 
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )

            newTokenInfo = response.json()
            
            if 'access_token' in newTokenInfo:
                accessTokenTime = datetime.now().timestamp() + newTokenInfo['expires_in']
               
                print('token refreshed, time: ', datetime.fromtimestamp(datetime.now().timestamp()))
                print('new expiry: ', datetime.fromtimestamp(accessTokenTime))
               
                os.putenv('Access_Token', newTokenInfo['access_token']) 
                os.putenv('Expire_Time', datetime.fromtimestamp(accessTokenTime) ) 
                return True
        else:
            return True #no token refresh needed
    
    return False #bad resps  || no refresh error

#creates file of playlists tracks in user specifc dir
    #returns file and path to file
        #++in special dir? => scalable/user
def makeTextFile(tracks: list, playlistName: str):
    
    usrID = querySpotify('me')['id']
    filename = playlistName.replace(' ', '_')
    path = f"{usrID}/{filename}.txt"
    f = open(path, 'w')
    f.write("Format: Song, album - artists \n\n")
    
    for track in tracks:
        name = track['track']['name']
        album = track['track']['album']['name']
        
        #TODO get all artist + features
        artists = track['track']['artists']
        artistNames = ''
        for artist in artists:
            if artist['type'] == 'artist':
                artistNames = artist['name'] + ', '
        
        f.write(f'{name}, {album} - {artistNames}\n')
        #print(track)
    
    f.close()
    return f, path

#querys spoitfy api 
    #returns json formanted data with status value true on success
def querySpotify(endpoint): 
    print('Querying')
    
    if (type(endpoint) is str) & checkAccessToken():
        response = requests.get(
            f"{API_BASE_URL}{endpoint}", 
            headers={
                'Authorization': 'Bearer '+ os.getenv('Access_Token', default='')
            }
        )
        
        print('resp Status: ', response.status_code)

        if 199 < response.status_code < 300: 
            info = response.json()
            info.update({'status':'success'})
            return info
        else:  
            return {"status":f'query error {response.status_code}'}   
    else:
        #token error ||  endpoint type error
        return {"status":'error'}         
        


#   --- endpoints ---   


#dummy landing PG?
@app.get("/")
def read_root():
    setSecrets()
    return "test"



'''
    ---    Login Endpoints   ---
'''

#Login endpoint
    #redirects user to spotify login page
@app.get("/login")
def login():
    print('login endpt')
    if setSecrets():

        params = {
            'response_type': 'code',
            'client_id': os.getenv('client_id'),
            'scope': scope,
            'redirect_uri':REDIRECT_URI,
            'show_dialog': True
        }

        return RedirectResponse(f"{AUTH_URL}?{urllib.parse.urlencode(params)}")
    else:
        return {'Error': 'API access'}

#callback endpoint
    #handles callback from spotify login returns redirect to frontend home page
@app.get("/callback/")
def callback(code: str | None = None): 
    print('callback endpt')
    
    if code: #success
        idSecret = os.getenv('client_id')+":"+os.getenv('client_secret')
        bytesS = idSecret.encode("utf-8")
        auth_base64 = str(base64.b64encode(bytesS), "utf-8")

        response = requests.post(
            TOKEN_URL, 
            data= {
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': REDIRECT_URI,         
            }, 
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Basic "+ auth_base64
            }
        )
        token_info = response.json()
        
        accessTokenTime = datetime.now().timestamp() + token_info['expires_in']

        ### ALT ###
        os.environ['Access_Token'] = str(token_info['access_token'])
        os.environ['Refresh_Token'] = str(token_info['refresh_token'])
        os.environ['Expire_Time'] = str(datetime.fromtimestamp(accessTokenTime))

        #makeUser specific dir (if not exists )
        dirs = os.scandir()
        exists = False
        usrID = querySpotify('me')['id']

        for dir in dirs:
            if (dir.name == usrID):
                exists = True

        if (not exists):
            os.mkdir(usrID)
        
        return RedirectResponse('http://localhost:5137/home')
    else:
        return {'Error': 'No Code returned in Auth'}

#refresh endpoint
    #refreshes access token and returns refruesh status as JSON
@app.get('/refresh')
def refresh():
    print('refresh endpt')
    if refreshToken(): 
        # return RedirectResponse('http://localhost:5173/home')
        return {'status': 'success'}
    else:
        return {'status': 'failure'}

    response = requests.post(
        TOKEN_URL, 
        data={
            'grant_type': 'refresh_token',
            'refresh_token': os.getenv('Refresh_Token'),
            'client_id': os.getenv('client_id'),
            'client_secret': os.getenv('client_secret')
        }
    )

#logout endpoint
    #clears env vars and redirects to front landing page
@app.get('/logout')
def logout():
    print('logout endpt')
    os.environ['Access_Token'] = ''
    os.environ['Refresh_Token'] = ''
    os.environ['Expire_Time'] = ''
    
    return RedirectResponse('http://localhost:5173/')



'''
    ---    User Info Endpoints   ---
'''

#user endpoint
    #returns userInfo json
@app.get('/user')
def user(): 
    print('user endpt')
    userInfo = querySpotify('me')

    if userInfo:
        if 'status' in userInfo:
            if userInfo['status'] == 'success':
                userInfo.update({'logged':'true'})

            elif userInfo['status'] == 'token error':
                if refreshToken():
                    userInfo = querySpotify('me')
                    if userInfo['status'] == 'success':
                        userInfo.update({'logged':'true'})
                    else:
                        userInfo.update({'logged': 'false','Error': 'Query Error'})
                else: userInfo.update({'logged': 'false','Error': 'Refresh Error'})
            
            else:
                userInfo.update({'logged': 'false','Error': 'Querry Error'})
        return userInfo
    else:
        print(userInfo)
        return {'Error': 'User Query'}

@app.get('/savedSongs')
def savedSongs(offset: int=0, limit: int=50):
    print('savedSongs endpt')
    savedSongs = querySpotify(f'me/tracks?offset={offset}&limit={limit}')

    if savedSongs and savedSongs['status'] == 'success':
        return savedSongs
    else:
        return {'Error': 'Saved Song Query Error'}

@app.get('/topArtists')
def topArtists(term: str='medium', offset: int=0, limit: int=50):
    print('topArtist endpt')
    topArtist = querySpotify(f'me/top/artists?time_range={term}_term&limit={limit}&offset={offset}')
    
    if topArtist and topArtist['status'] == 'success':
        return topArtist
    else:
        return {'Error': 'Top Artists Query Error'}

@app.get('/topTracks')
def topTracks(term: str='medium', offset: int=0, limit: int=50):
    print('topTracks endpt')
    topTracks = querySpotify(f'me/top/tracks?time_range={term}_term&limit={limit}&offset={offset}')
    
    if topTracks and topTracks['status'] == 'success':
        return topTracks
    else:
        return {'Error': 'Top Items Query Error'}


'''
    ---    Playlist Endpoint    ---
'''
#TODO 
    # +parseplaylist function
    # playlist/totext test & front end implementation
    # playlist/ offset check

@app.get('/playlists')
def playlists(offset: int=0, limit: int=50):
    print('playlist endpt')
    playlistsInfo = querySpotify(f'me/playlists?offset={offset}&limit={limit}')

    if playlistsInfo and 'status' in playlistsInfo:
        if playlistsInfo['status'] == 'success':
            playlistsInfo.update({'logged':'true'})
                
            # if 'items' in playlistsInfo:
            #     #total = playlistsInfo['total']
            #     #playlists = playlistsInfo['items']
            #     print('Da kitchen Is gettin HOT')
            #     # while (len(playlists) < total) and next:
            #     #     headers ={
            #     #         'Authorization': 'Bearer '+ os.getenv('Access_Token')
            #     #     }
            #     #     resp = requests.get(next, headers=headers)
            #     #     if 199 < resp.status_code < 300: 
            #     #         resp =resp.json()      
            #     #         nextPlaylists = resp['items']
            #     #         playlists.append(nextPlaylists)
            #     #         next = playlistsInfo['next']
            #     #     else:
            #     #         print('We have a problem Doc')
            return playlistsInfo
            
        elif playlistsInfo['status'] == 'token error':
            if refreshToken():
                playlistsInfo = querySpotify('me')
                return playlistsInfo.update({'logged':'true'})
    return playlistsInfo.update({'Error': 'Playlists Query Error'})

@app.get('/playlist/toText/{playlistID}', response_class=FileResponse)
def toText(playlistID: str):
    print(f'\n---toText {playlistID} endpt---\n')
    playlistInfo = querySpotify(f'playlists/{playlistID}')
    
    if playlistInfo and playlistInfo['tracks']:
        file, path = makeTextFile(playlistInfo['tracks']['items'], playlistInfo['name'])
        return path
    return 'wow that sucks'

@app.get('/playlist/{playlistID}')
def playlist(playlistID: str = ""):
    print(f'playlist {playlistID} endpt')

    playlistInfo = querySpotify(f'playlists/{playlistID}')
    if playlistInfo:
        return playlistInfo
    else:
        return {'Error': 'User Query Error'}


#TODO test
@app.post('/toListenTo') 
    #recives: songURI ?+playlistID?
    #pydantic: body contians json objects !!body is not object itself!!
def addtoListenTo(songURI: Annotated[str, Body()]):
    print('toListenTo endpt')
    print('adding: ', songURI)
    if songURI:
        toListenTo = '' # add to file for fast access on second time
        playlistInfo = querySpotify('me/playlists?limit=50')
        authHeaders = {'Authorization': 'Bearer '+ os.getenv('Access_Token') }
        
    #finding toListenTo
        while (toListenTo == '' and  playlistInfo['next'] != None):
            for playlist in playlistInfo['items']:
                if (playlist["description"] == 'toListenTo'):
                    toListenTo = playlist['id']
                    break           
            #check resp code
            playlistInfo = requests.get(playlistInfo['next'], headers=authHeaders).json()
   
    #creating playlist
        if (toListenTo == ''): 
            userID = querySpotify('me')['id']  
            res = requests.post(
                url= API_BASE_URL+f'users/{userID}/playlists', 
                json={
                    "name":"toListenTo",
                    "description":"toListenTo",
                    "public":False
                },
                headers=authHeaders
            )

            if (199 < res.status_code < 300):
                toListenTo = res.json()['id']
                print("created: ", toListenTo)
            else:
                return {"error":"playlist creation", "msg":res.json()}

    # add song to playlist
        print("adding to:", toListenTo)
        if (toListenTo != ''):

            res = requests.post(
                url=API_BASE_URL+f'playlists/{toListenTo}/tracks', 
                json= {"uris": [songURI]}, 
                headers=authHeaders
            )
            if (199 < res.status_code < 300):
                return "success"
            else:
                return {"error": "addiing track", "msg": res.json()}
    
    return "error"


@app.get('/search')
def toListenTo(searchstr: str, type: str = "track", offset: int = 0):
    itemInfo = querySpotify(f'search?q={searchstr}&type={type}&limit=50&offset={offset}')
    return itemInfo

if __name__ == "__main__":
    print("Note: .env loads once per run")
    uvicorn.run(app, port=5000)
    #temporary reset auth