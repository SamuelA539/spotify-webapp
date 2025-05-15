import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import RedirectResponse, JSONResponse
#from fastapi.requests import Request #TODO check

import urllib.parse, base64, os, requests
from datetime import datetime
from dotenv import load_dotenv


REDIRECT_URI = 'http://127.0.0.1:5000/callback'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-library-read user-top-read'

frontendURL='http://localhost:3000'

app = FastAPI()

origins = [
    "https://localhost:5173",
    "http://localhost:5173",

    "http://127.0.0.1:5173",
    "https://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)





#   ---   helper functions   ---
#TODO !!!!IRON OUT LOGGING IN AND REFRESHES


#TODO !!TEST!!
    #true if valid
def checkAccessToken():
    load_dotenv()
    
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

#returns encoded authURL
def getAuthUrl():
    load_dotenv()

    params = {
        'response_type': 'code',
        'client_id': os.getenv('client_id'),
        'scope': scope,
        'redirect_uri':REDIRECT_URI,
        'show_dialog': True
    }

    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    return auth_url

#dif implementation 
    #True if Success
def refreshToken():
    load_dotenv()
    if os.getenv('Refresh_Token'):  #refresh token exits
        if not checkAccessToken(): # token Expired
           
            header=     {
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            req_body = {
                'grant_type': 'refresh_token',
                'refresh_token':os.getenv('Refresh_Token'),
                'client_id': os.getenv("client_id"),
                'client_secret': os.getenv("client_secret")
            }

            #print(f'req: {req_body}')

            response = requests.post(TOKEN_URL, data=req_body, headers=header)
            newTokenInfo = response.json()
            
            # print('refresh response: ')
            # print(newTokenInfo)
            
            if 'access_token' in newTokenInfo:
                accessTokenTime = datetime.now().timestamp() + newTokenInfo['expires_in']
               
                print('token refreshed, time: ', datetime.fromtimestamp(datetime.now().timestamp()))
                print('new expiry: ', datetime.fromtimestamp(accessTokenTime))
               
                os.putenv('Access_Token',newTokenInfo['access_token']) 
                #os.putenv('Expire_Time', str(accessTokenTime) )  datetime.fromtimestamp(accessTokenTime)
                os.putenv('Expire_Time', datetime.fromtimestamp(accessTokenTime) ) 
                return True
    return False

#in special dir on server? => scalable/user
def makeTextFile(tracks, playlistName):
    f = open(f"{playlistName}.txt", 'w')
    
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
    return f

#TODO !!!TEST!!! should never return None
#same datatype both outputs?
def querySpotify(endpoint): 
    load_dotenv()
    print('Querying')
    
    if (type(endpoint) is str) & checkAccessToken():
        headers ={
            'Authorization': 'Bearer '+ os.getenv('Access_Token', default='')
        }
        response = requests.get(f"{API_BASE_URL}{endpoint}", headers=headers)
        
        #print('response sent')
        print('resp Status: ',response.status_code)

        if 199 < response.status_code < 300: #good resp
            #print('good resp')
            info = response.json()
            #print(type(info))
            info.update({'status':'success'})
            return info
        else:   #bad resp
            print("error with reqest: ", response.json())
            return {"status":f'query error {response.status_code}'}   
    else:
        print('access token/ type error (probably)')
        return {"status":f'token error?'} 
        #print('i/p type: ' ,type(endpoint))     
        
        


#   --- endpoints ---   

#dummy landing PG?
@app.get("/")
def read_root():
    return "test"




'''
    ---    Logging Endpoint    ---
'''

#LogIn endpoint
@app.get("/login")
def login():
    print('login endpt')
    load_dotenv()

    params = {
        'response_type': 'code',
        'client_id': os.getenv('client_id'),
        'scope': scope,
        'redirect_uri':REDIRECT_URI,
        'show_dialog': True
    }

    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"

    data = {
        'auth_url': auth_url
    }

    print('authURL: ', auth_url)

    return RedirectResponse(auth_url)
    #return data

#TODO make scalable & globalize tokenTime val(cred file instead of env?) 
    #try to make app rerun on login or reset env var?
@app.get("/callback/")
def callback(code: str | None = None): 
    print('callback endpt')
    load_dotenv()

    if code: #success
        idSecret = os.getenv('client_id')+":"+os.getenv('client_secret')
        bytesS = idSecret.encode("utf-8")
        auth_base64 = str(base64.b64encode(bytesS), "utf-8")

        req_header = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Basic "+ auth_base64
        }
        
        req_body = {
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,         
        } 

        response = requests.post(TOKEN_URL, data=req_body, headers=req_header)
        token_info = response.json()
        
        #print('Callback info: ', token_info)
        
        #access token key alreadry in .env
        load_dotenv()
        
        accessTokenTime = datetime.now().timestamp() + token_info['expires_in']
        
        print('time given(callback): ', float(token_info['expires_in']))
        print('cur time(callback): ', datetime.fromtimestamp(datetime.now().timestamp())) 
        print('env time(callback): ', datetime.fromtimestamp(accessTokenTime))



        # env = open('.env', 'w')

        # secert = os.getenv('client_secret')
        # id = os.getenv('client_id')

        # env.write(f'client_id = {id}\n')
        # env.write(f'client_secret = {secert}\n')
        # env.write(f'Access_Token={token_info['access_token']}\n')
        # env.write(f'Refresh_Token={token_info['refresh_token']}\n')
        # env.write(f'Expire_Time={datetime.fromtimestamp(accessTokenTime)}\n')

        # env.close()

        ### ALT ###
        os.environ['Access_Token'] = str(token_info['access_token'])
        os.environ['Refresh_Token'] = str(token_info['refresh_token'])
        os.environ['Expire_Time'] = str(datetime.fromtimestamp(accessTokenTime))


        #print("Access Token Life: ", accessTokenTime)
        #return RedirectResponse(frontendURL+'/Home') #/profile 

        #return RedirectResponse('/user')
        return RedirectResponse('http://localhost:5173/home')
    else:
        return {'Error': 'No Code reuturned in Auth'}

#TODO probably more checks
@app.get('/refresh')
def refresh():
    print('refresh endpt')
    #reset env vars s.t dosent need rerun

    #if expired
    req_body = {
            'grant_type': 'refresh_token',
            'refresh_token': os.getenv('Refresh_Token'),
            'client_id': os.getenv('client_id'),
            'client_secret': os.getenv('client_secret')
        }

    response = requests.post(TOKEN_URL, data=req_body)
    newTokenInfo = response.json()
    if (newTokenInfo):
        print('refresh response: ', newTokenInfo)

        os.environ['Access_Token'] = newTokenInfo['access_token'] 
        os.environ['Expire_Time'] = str(datetime.fromtimestamp(datetime.now().timestamp() + newTokenInfo['expires_in'])) #doesnt set?

        print('Refreshed Expire Time: ', os.environ['Expire_Time'])
        return RedirectResponse('http://localhost:5173/home')
    else:
        return {'Error': 'Refresh Error'}

@app.get('/logout')
def logout():
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
    userInfo = querySpotify('me')

    print('\nuser endpt')
    print('User info ', userInfo)

    if userInfo:
        if 'status' in userInfo:
            if userInfo['status'] == 'success':
                userInfo.update({'logged':'true'})
                return userInfo
            
            elif userInfo['status'] == 'token error':
                if not checkAccessToken():
                    refreshToken()
                    userInfo = querySpotify('me')
                    print('UserInfo()',userInfo)
                    userInfo.update({'logged':'true', 'Error':'Refresh'})
                    return userInfo
                else:
                    print('Other Error')
    
        userInfo.update({'logged': 'false','Error': 'User Query'})
        return userInfo
    else:
        print(userInfo)
        return {'Error': 'User Query'}

@app.get('/savedSongs')
def savedSongs(offset: int=0, limit: int=50):
    print('savedSongs endpt')
    savedSongs = querySpotify(f'me/tracks?offset={offset}&limit={limit}')
    #print('Saved Songs: ', savedSongs)
    
    if savedSongs:
        return savedSongs
    else:
        return {'Error': 'Saved Song Query Error'}

@app.get('/topArtists')
def topArtists(term: str='medium',offset: int=0, limit: int=50):
    print('topArtist endpt')
    topItems = querySpotify(f'me/top/artists?time_range={term}_term&limit={limit}&offset={offset}')
    
    if topItems:
        return topItems
    else:
        return {'Error': 'Top Artists Query Error'}

@app.get('/topTracks')
def topTracks(term: str='medium', offset: int=0, limit: int=50):
    print('topTracks endpt')
    topItems = querySpotify(f'me/top/tracks?time_range={term}_term&limit={limit}&offset={offset}')
    
    if topItems:
        return topItems
    else:
        return {'Error': 'Top Items Query Error'}


'''
    ---    Playlist Endpoint    ---
'''

#TODO iron out like user
    #get all playlist items
    #retrun {total:'',items:'', href:'' }
@app.get('/playlists')
def playlists(offset: int=0, limit: int=50):
    print('\nplaylist endpt')
    playlistsInfo = querySpotify(f'me/playlists?offset={offset}&limit={limit}')

    if playlistsInfo:
        if 'status' in playlistsInfo:
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
                    playlistsInfo.update({'logged':'true'})
                    return playlistsInfo
    
        playlistsInfo.update({'Error': 'Playlists Query Error'})
    return playlistsInfo


#TODO iron out offset?
@app.get('/playlist/{playlistID}')
def playlist(playlistID: str = ""):
    
    print(f'playlist{playlistID} endpt')

    playlistInfo = querySpotify(f'playlists/{playlistID}')
    if playlistInfo:
        return playlistInfo
    else:
        return {'Error': 'User Query Error'}
#libaray/playlists/{playlist_id} endpoint


#TODO finish: make request body
@app.post('/playlist/toText/{playlistID}')
def toText(playlistID ):
    return 'coming soon'

if __name__ == "__main__":
    print("Note: .env loads once per run")
    uvicorn.run(app, port=5000)
    #temporary reset auth