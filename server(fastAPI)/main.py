import uvicorn
from typing import Annotated
from fastapi import FastAPI, Response, HTTPException, Cookie, Body, Query #Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from pydantic import BaseModel, AfterValidator
from datetime import datetime

import urllib.parse, base64, os, requests
#from fastapi.requests import Request #TODO check

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

scope = 'playlist-read-private ' \
'playlist-read-collaborative playlist-modify-private playlist-modify-public ' \
'user-library-read user-top-read'

frontendURL='http://localhost:5137'
REDIRECT_URI = 'http://127.0.0.1:5000/callback'  

app = FastAPI()

origins = [
    "https://localhost:5137",
    "http://localhost:5137",

    "http://127.0.0.1:5137",
    "https://127.0.0.1:5137",
]

#TODO configure properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

class userCredCookies(BaseModel):
    access_token: str
    refresh_token: str
    expire_time: str



#   ---   functions   ---
#checks access token expirery in evironment variabes
    #TODO make Cookie based
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
    #TODO make Cookie based
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
    #TODO make Cookie based
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


#test page
@app.get("/")
def read_root():
    return "test"



#---    Spotify Account Endpoints   ---
    #TODO utilise cookies

@app.get("/login", summary="Logs into spotify")
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
    
    return 'error'

@app.get("/callback/", summary="Callback endpoint for spotify Login")
def callback(code: str | None = None):
    print('callback endpt')
    
    if not code:
        'error'

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
    
    response = RedirectResponse('http://localhost:5137/')
#TODO integrate Cookies
    # maxAge = 60*60*24*7
    # response.set_cookie(key='access_token', value=str(token_info['access_token']), max_age=maxAge)
    # response.set_cookie(key='refresh_token', value=str(token_info['refresh_token']), max_age=maxAge)
    # response.set_cookie(key="expire_time", value=str(datetime.fromtimestamp(accessTokenTime)), max_age=maxAge)

    #makeUser specific dir (if not exists )
    dirs = os.scandir()
    exists = False
    usrID = querySpotify('me')['id']

    for dir in dirs:
        if (dir.name == usrID):
            exists = True

    if (not exists):
        os.mkdir(usrID)
    
    return response

@app.get('/refresh', summary="Refreshes user's spotify access token")
def refresh():
    print('refresh endpt')
    if refreshToken(): 
        # return RedirectResponse('http://localhost:5173/home')
        return {'status': 'success'}
    return 'error'

@app.get('/logout', summary="Clears user's spotify access data from server")
def logout():
    print('logout endpt')
    os.environ['Access_Token'] = ''
    os.environ['Refresh_Token'] = ''
    os.environ['Expire_Time'] = ''
    
    return RedirectResponse('http://localhost:5173/')



#---    User Info Endpoints   ---
   #TODO: 
   #    use more objects 
   #    http Errors [exceptions on failed queries]

def termValidator(term:str):
    terms = {'short', 'medium', 'long'}
    return (term in terms)

#TODO shorten checks
#TODO check query
@app.get('/user', summary="Returns user's profile info")
def user(userCred: Annotated[userCredCookies, Cookie()]): 
    print('user endpt')
    print('user cred cookies:', userCred)
    userInfo = querySpotify('me')

    if userInfo['status'] == 'success':
        userInfo.update({'logged':'true'})
        return userInfo
    else:
        print(userInfo)
        return 'error'

@app.get('/savedSongs', summary="Returns user's saved songs")
def savedSongs(offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('savedSongs endpt')
    savedSongs = querySpotify(f'me/tracks?offset={offset}&limit={limit}')

    if savedSongs['status'] == 'success' and savedSongs:
        return savedSongs
    else:
        return 'error'

#TODO can send progress to client?
@app.get('/savedSongs/toText', response_class=FileResponse, summary="Returns text file of users saved songs")
def savedSongsToText():
    print('\nsaved songs toText')

#creating file of saved songs
    userInfo = querySpotify('me')['id']
    if userInfo['status'] == 'success':
        filename = 'savedSongs'
        path = f"{userInfo['id']}/{filename}.txt"
        f = open(path, 'w')
        f.write("Format: Song, album - artists \n\n")
        
        size = 0
        nextTracks = f'{API_BASE_URL}{f'me/tracks?offset={0}&limit={50}'}'
        while nextTracks and size < 10000:
            resp = requests.get(
                nextTracks,
                headers={
                    'Authorization': 'Bearer '+ os.getenv('Access_Token')
                }
            )
            if 199 < resp.status_code < 300:
                resp = resp.json()

                for track in resp['items']:
                    name = track['track']['name']
                    album = track['track']['album']['name']
                    
                    #TODO get all artist + features
                    artists = track['track']['artists']
                    artistNames = ''
                    for artist in artists:
                        if artist['type'] == 'artist':
                            artistNames = artist['name'] + ', '
                    
                    f.write(f'{name}, {album} - {artistNames}\n')
                    size += 1

                    print(f'{name}, {album} - {artistNames}')
                    print(f"saved song progress {size}/{resp['total']}" )

                nextTracks = resp['next']
                print('next url: ', nextTracks)
            else:
                #error
                print('error loading tracks ', resp.status_code)
                nextTracks = None
        f.close()

        print('Songs Saved: ', size)
        return path
    return 'error'

@app.get('/topArtists', summary="Returns users's top artists")
def topArtists(term: str='medium', offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('topArtist endpt')
    
    if termValidator(term):
        topArtists = querySpotify(f'me/top/artists?time_range={term}_term&limit={limit}&offset={offset}')
    if topArtists and topArtists['status'] == 'success':
        return topArtists
    
    return 'Error'

@app.get('/topTracks', summary="Returns users's top tracks")
def topTracks(term: str='medium', offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('topTracks endpt')
    
    if termValidator(term):
        topTracks = querySpotify(f'me/top/tracks?time_range={term}_term&limit={limit}&offset={offset}')
    if topTracks and topTracks['status'] == 'success':
        return topTracks
    
    return 'Error'


#---    Playlist Endpoint    ---
    #TODO:
    #    use more objects 
    #    http Errors [exceptions on failed queries]

@app.get('/playlists', summary="Returns user's playlists")
def playlists(offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('playlist endpt')
    playlistsInfo = querySpotify(f'me/playlists?offset={offset}&limit={limit}')

    if playlistsInfo['status'] == 'success':
        playlistsInfo.update({'logged':'true'})
        return playlistsInfo 
    return 'error'

#check spotify playlist id restrictions for path checks
#TODO dont use makefile function
@app.get('/playlist/toText/{playlistID}', response_class=FileResponse, summary="Returns text file of tracks in user's playlists")
def toText(playlistID: str):
    print(f'\n---toText {playlistID} endpt---\n')
    playlistInfo = querySpotify(f'playlists/{playlistID}')
    
    if playlistInfo['status'] == 'success' and playlistInfo['tracks']:
        file, path = makeTextFile(playlistInfo['tracks']['items'], playlistInfo['name'])
        return path
    return 'error'

@app.get('/playlist/{playlistID}', summary="Returns information on user playlist")
def playlist(playlistID: str):
    print(f'playlist {playlistID} endpt')

    playlistInfo = querySpotify(f'playlists/{playlistID}')
    if playlistInfo['status'] == 'success':
        return playlistInfo
    
    return 'Error'


@app.post('/toListenTo', summary="Adds track to toListenTo playlist") 
def addtoListenTo(songURI: Annotated[str, Body()]):
    print('toListenTo post endpt')
    print('adding: ', songURI)

    toListenTo = '' # add to file for fast access on second time
    playlistInfo = querySpotify('me/playlists?limit=50')

    if playlistInfo['status'] == 'succes':        
#finding toListenTo
        while (playlistInfo['next']):
            for playlist in playlistInfo['items']:
                if (playlist["description"] == 'toListenTo'):
                    toListenTo = playlist['id']
                    break           
            resp = requests.get(playlistInfo['next'], headers={'Authorization': 'Bearer '+ os.getenv('Access_Token')})
            if 199 < resp.status_code < 300:
                playlistInfo = resp.json()
            else:
                break
                #error 

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
                headers={'Authorization': 'Bearer '+ os.getenv('Access_Token')}
            )

            if (199 < res.status_code < 300):
                toListenTo = res.json()['id']
                print("created: ", toListenTo)
            # else:   #error
    
        # add song to playlist 
        print("adding to:", toListenTo)
        if (toListenTo != ''):
            resp = requests.post(
                url=API_BASE_URL+f'playlists/{toListenTo}/tracks', 
                json= {"uris": [songURI]}, 
                headers={'Authorization': 'Bearer '+ os.getenv('Access_Token')}
            )
            if (199 < resp.status_code < 300):
                return {"status":"success", "id": toListenTo}
            # else: # errror

    return "error"

@app.get('/toListenTo', summary='Returns Information for toListenTo playlist')
def getToListenTo():
    print('toListenTo get endpt')

    toListenTo = ''
    playlistInfo = querySpotify('me/playlists?limit=50')
    
    if playlistInfo['status'] == 'success':  
#finding toListenTo
        while (playlistInfo['next']):
            for playlist in playlistInfo['items']:
                if (playlist["description"] == 'toListenTo'):
                    toListenTo = playlist['id']
                    break           
            resp = requests.get(
                playlistInfo['next'], 
                headers={'Authorization': 'Bearer '+ os.getenv('Access_Token') }
                )
            if 199 < resp.status_code < 300:
                playlistInfo = resp.json()
            else:
                raise HTTPException(status_code=500, detail='Server Request Error')
   
#creating playlist
        if (toListenTo == ''): 
            userID = querySpotify('me')['id']
            if playlistInfo['status'] == 'success':   
                resp = requests.post(
                    url= API_BASE_URL+f'users/{userID}/playlists', 
                    json={
                        "name":"toListenTo",
                        "description":"toListenTo",
                        "public":False
                    },
                    headers={'Authorization': 'Bearer '+ os.getenv('Access_Token') }
                )
                if (199 < resp.status_code < 300): #!!!TODO check can good resp have bad data
                    toListenTo = resp.json()['id']
                    print("created: ", toListenTo)
        
    if toListenTo:
        return {"id": toListenTo}
    
    # raise HTTPException(status_code=500, detail="Error getting toListenTo playlist id")
    return "error"


def itemTypeValidator(type):
    types = {'track'}
    return type in types

@app.get('/search', summary="Returns search results of search string")
def toListenTo(searchstr: str, itemType: str = "track", offset: Annotated[int, Query(ge=0)] = 0):
    print('search url params: ',offset, itemType)
    
    if itemTypeValidator(itemType):
        itemInfo = querySpotify(f'search?q={searchstr}&type={itemType}&limit=50&offset={offset}')
    if itemInfo['status' == 'success']:
        return itemInfo
    
    print('Query Status: ', itemInfo['status'])
    # raise HTTPException(status_code=500, detail='Error getting Search Results')
    return "error"


if __name__ == "__main__":
    print("Note: .env loads once per run")
    uvicorn.run(app, port=5000)
    #temporary reset auth