import uvicorn
from typing import Annotated
from fastapi import FastAPI, Response, HTTPException, Cookie, Body, Query #Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from pydantic import BaseModel, AfterValidator
from datetime import datetime

# from app import exceptions
import base64, os, requests 
#from fastapi.requests import Request 

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

scope = 'playlist-read-private ' \
'playlist-read-collaborative playlist-modify-private playlist-modify-public ' \
'user-library-read user-top-read'

frontendURL='http://localhost:5137/'
REDIRECT_URI = 'http://127.0.0.1:5000/callback'  

app = FastAPI()

origins = [
    "https://localhost:5137",
    "http://localhost:5137",

    "http://127.0.0.1:5137",
    "https://127.0.0.1:5137",
]

#TODO configure 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

class userCredCookies(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    expire_time: str | None = None



#   ---   functions   ---

#sets environ valraibles form contianer secrets 
def setSecrets():
    f = open('/run/secrets/spotifyCred')
    if f:
        data = f.read().split('\n')
        os.environ['client_id'] = data[0].split(" = ")[1]
        os.environ['client_secret'] = data[1].split(" = ")[1]
    #not needed? initialized on callback
        # os.environ['Access_Token'] = data[3].split("=")[1]
        # os.environ['Refresh_Token'] = data[4].split(" = ")[1]
        # os.environ['Expire_Time'] = data[5].split(" = ")[1]
        return True
    raise HTTPException(status_code=500, detail="Server Initalization Error")

  
#refreshes access token
#TODO test
def refreshToken(refreshToken: str):
    if refreshToken: # can be refreshed 
        response = requests.post(
            TOKEN_URL, 
            data={
                'grant_type': 'refresh_token',
                'refresh_token':refreshToken,
                'client_id': os.getenv("client_id"),
                'client_secret': os.getenv("client_secret")
            }, 
            headers={
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        if 199 < response.status_code < 400:
            print('success response')
            newTokenInfo = response.json() 
            if 'access_token' in newTokenInfo:
                accessTokenTime = datetime.now().timestamp() + newTokenInfo['expires_in']
                return newTokenInfo['access_token'], str(datetime.fromtimestamp(accessTokenTime))
            
        print('refresh error', response)
        raise HTTPException(status_code=500, detail="Bad Server Refresh Request Response")
    raise HTTPException(status_code=500, detail="Refresh method call Error")

#errs 
#   bad response
#   auth prob
def querySpotify(accessToken: str, expTime: str, endpoint: str = ''): 
    print('Querying')

    if endpoint and datetime.fromisoformat(expTime) > datetime.now() and accessToken:
        response = requests.get(
            f"{API_BASE_URL}{endpoint}", 
            headers={
                'Authorization': 'Bearer '+ accessToken
            }
        )

        if 199 < response.status_code < 400: 
            info = response.json()
            info.update({'status':'success'})
            print('token  success')
            return info
        print('request error ', 'response:', response)
        return {"status":'error', 'details': 'bad response'}   
    else:   #token error ||  endpoint type error
        print('param error')
        return {"status":'error', 'details': 'param error'}         
        


#   --- endpoints ---   
#test page
@app.get("/")
def read_root():
    return "test"



#---    Spotify Account Endpoints   ---


#errs
#   init app cred
@app.get("/login", summary="Logs into spotify")
def login(userCred: Annotated[userCredCookies, Cookie()]):
    print('login endpt')
    if setSecrets(): #for api auth data 
        if userCred.access_token and userCred.refresh_token and userCred.expire_time:
            print('cookies found')
            return RedirectResponse(frontendURL+'home')
        else:
            print('cookies not found')
            return RedirectResponse(f"{AUTH_URL}?response_type=code&client_id={os.getenv('client_id')}&scope={scope}&redirect_uri={REDIRECT_URI}&show_dialog=True")
    print('secrets error')
    return 'error'
    

#errs 
#   bad resp - no auth code
#   bad reso - auth token info
#   bad query/app init err - no usr dir
#TODO make cookie acccessable in client
@app.get("/callback/", summary="Callback endpoint for spotify Login")
def callback(code: str | None = None):
    print('callback endpt')
    if code:
        idSecret = os.getenv('client_id')+":"+os.getenv('client_secret')
        bytesS = idSecret.encode("utf-8")
        auth_base64 = str(base64.b64encode(bytesS), "utf-8")
        resp = requests.post(
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

        if 199 < resp.status_code < 300:
            token_info = resp.json()
            accessTokenTime = datetime.now().timestamp() + token_info['expires_in']

            ### ALT ###
            os.environ['Access_Token'] = str(token_info['access_token'])
            os.environ['Refresh_Token'] = str(token_info['refresh_token'])
            os.environ['Expire_Time'] = str(datetime.fromtimestamp(accessTokenTime))
            
            response = RedirectResponse(frontendURL+'home')

            response.set_cookie(key='callback', value='test', domain='.localhost:5137')

            #makeUser specific dir (if not exists )
            exists = False
            usrQuery = querySpotify(os.environ['Access_Token'], os.environ['Expire_Time'], 'me')
            if usrQuery['status'] == 'success':
                usrID = usrQuery['id']
                for dir in os.scandir():
                    if (dir.name == usrID):
                        exists = True
                if (not exists):
                    os.mkdir(usrID)

                print('callback success')
                return response
            #no usr dir - no toText
    print('callback error')
    return 'error'

#TODO test redirect
@app.get('/logout', summary="Clears user's spotify access data from server")
def logout(response: Response ):
    print('logout endpt')
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("expire_time")
    # return 'success'
    print('log out success')
    return RedirectResponse(frontendURL)



#---    User Info Endpoints   ---
   #TODO: http Errors [exceptions on failed queries]

def termValidator(term:str):
    terms = {'short', 'medium', 'long'}
    return (term in terms)

#errs 
#   query failure
@app.get('/user', summary="Returns user's profile info")
def user(
    userCred: Annotated[userCredCookies, Cookie()], 
    response: Response):

    print('user endpt')
    userInfo = None

    if not (userCred.access_token or userCred.refresh_token or userCred.expire_time):
        print('no cookies')
        if os.getenv('Access_Token') and os.getenv('Refresh_Token') and os.getenv('Expire_Time'):
            response.set_cookie(key='access_token', value=os.environ['Access_Token'])
            response.set_cookie(key='refresh_token', value=os.environ['Refresh_Token'])
            response.set_cookie(key="expire_time", value=os.environ['Expire_Time'])
            
            userInfo = querySpotify(os.environ['Access_Token'], os.environ['Expire_Time'], 'me')    
    else:
        print('cookies')
        if datetime.fromisoformat(str(userCred.expire_time)) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            userInfo = querySpotify(accessTok, expTime, 'me')
        else:
            print('cookie querry')
            userInfo = querySpotify(
                accessToken=userCred.access_token, 
                expTime=userCred.expire_time, 
                endpoint='me')

    if userInfo and userInfo['status'] == 'success':
        userInfo.update({'logged':'true'})
        return userInfo

    print('user endpt - error')       
    return 'error'

#errs 
#   query failure
#cookie required data
@app.get('/savedSongs', summary="Returns user's saved songs")
def savedSongs(
    response: Response,
    userCred: Annotated[userCredCookies, Cookie()], 
    offset: Annotated[int, Query(ge=0)] = 0, 
    limit: Annotated[int, Query(ge=15, le=50)] = 50):

    print('savedSongs endpt')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            savedSongs = querySpotify(accessTok, expTime, f'me/tracks?offset={offset}&limit={limit}')    
        else:
            savedSongs = querySpotify(userCred.access_token, userCred.expire_time, f'me/tracks?offset={offset}&limit={limit}')    
        
        if savedSongs and savedSongs['status'] == 'success':
            return savedSongs
    
    print('savedSongs endpt - error')
    return 'error'


#errs 
#   query failure
#   bad resp
#TODO send progress to client?
@app.get('/savedSongs/toText', response_class=FileResponse, summary="Returns text file of users saved songs")
def savedSongsToText(response: Response, userCred: Annotated[userCredCookies, Cookie()], ):

    print('\nsaved songs toText')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            userInfo = querySpotify(accessTok, expTime, 'me')
        else:
            userInfo = querySpotify(userCred.access_token, userCred.expire_time, 'me')
    
        if userInfo['status'] == 'success':#creating file of saved songs
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
                        'Authorization': 'Bearer '+ userCred.access_token
                    }
                )
                if 199 < resp.status_code < 300:
                    resp = resp.json()

                    for track in resp['items']:
                        name = track['track']['name']
                        album = track['track']['album']['name']
                        
                        #TODO get all artist + features (str formating)
                        artists = track['track']['artists']
                        artistNames = ''
                        for artist in artists:
                            if artist['type'] == 'artist':
                                artistNames = artist['name'] + ', '
                        
                        f.write(f'{name}, {album} - {artistNames}\n')
                        size += 1

                        # print(f'{name}, {album} - {artistNames}')
                        print(f"saved song progress {size}/{resp['total']}" )
                    
                    nextTracks = resp['next']
                else:
                    #error
                    print('error loading tracks ', resp.status_code)
                    nextTracks = None
            f.close()

            print('Songs Saved: ', size)
            return path

    print('savedSong(toText) endpt -  error')
    return 'error'

#errs 
#   query failure
@app.get('/topArtists', summary="Returns users's top artists")
def topArtists(
    response: Response,
    userCred: Annotated[userCredCookies, Cookie()], 
    term: str='medium', offset: Annotated[int, Query(ge=0)] = 0, 
    limit: Annotated[int, Query(ge=15, le=50)] = 50):

    print('topArtist endpt')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time and termValidator(term):
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            topArtists = querySpotify(accessTok, expTime, f'me/top/artists?time_range={term}_term&limit={limit}&offset={offset}')
        else:
            topArtists = querySpotify(userCred.access_token, userCred.expire_time, f'me/top/artists?time_range={term}_term&limit={limit}&offset={offset}')
    
        if topArtists['status'] == 'success':
            return topArtists
    
    print('topArtists endpt - error')
    return 'error'

#errs 
#   query failure
@app.get('/topTracks', summary="Returns users's top tracks")
def topTracks(
    response: Response,
    userCred: Annotated[userCredCookies, Cookie()], 
    term: str='medium', offset: Annotated[int, Query(ge=0)] = 0, 
    limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('topTracks endpt')
    
    if userCred.access_token and userCred.refresh_token and userCred.expire_time and termValidator(term):
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            topTracks = querySpotify(accessTok, expTime, f'me/top/tracks?time_range={term}_term&limit={limit}&offset={offset}')
        else:
            topTracks = querySpotify(userCred.access_token, userCred.expire_time, f'me/top/tracks?time_range={term}_term&limit={limit}&offset={offset}')
    
        if topTracks['status'] == 'success':
            return topTracks
    
    print('topTracks endpt - error')
    return 'Error'


#---    Playlist Endpoint    ---

#errs 
#   query failure
@app.get('/playlists', summary="Returns user's playlists")
def playlists(
    response: Response, 
    userCred: Annotated[userCredCookies, Cookie()], 
    offset: Annotated[int, Query(ge=0)] = 0, 
    limit: Annotated[int, Query(ge=15, le=50)] = 50):
    
    print('playlist endpt')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            playlistsInfo = querySpotify(accessTok, expTime, f'me/playlists?offset={offset}&limit={limit}')
        else:
            playlistsInfo = querySpotify(userCred.access_token, userCred.expire_time, f'me/playlists?offset={offset}&limit={limit}')

        if playlistsInfo['status'] == 'success':
            playlistsInfo.update({'logged':'true'})
            return playlistsInfo 

    print('playlist endpt - error')
    return 'error'

#check spotify playlist id restrictions for path checks
@app.get('/playlist/toText/{playlistID}', response_class=FileResponse, summary="Returns text file of tracks in user's playlists")
def toText(
    response: Response,
    userCred: Annotated[userCredCookies, Cookie()], 
    playlistID: str):

    print(f'\n---toText {playlistID} endpt---\n')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            playlistInfo = querySpotify(accessTok, expTime, f'playlists/{playlistID}')
            userInfo = querySpotify(userCred.access_token, expTime, 'me')
        else:
            playlistInfo = querySpotify(userCred.access_token, userCred.expire_time, f'playlists/{playlistID}')
            userInfo = querySpotify(userCred.access_token, userCred.expire_time, 'me')
        
        if playlistInfo['status'] == 'success' and userInfo['status'] == 'success': 
            path = f"{userInfo['id']}/{playlistInfo['name']}.txt"
            f = open(path, 'w')
            f.write("Format: Song, album - artists \n\n")
            size = 0
            
            print('playlisttoText tracks: ', playlistInfo['tracks']['total'])

            for track in playlistInfo['tracks']['items']:
                print('name: ', track['track']['name'])
                print('album: ', track['track']['album']['name'])
                
                #TODO get all artist + features (str formating)
                artistNames = ''
                for artist in track['track']['artists']:
                    if artist['type'] == 'artist':
                        artistNames = artist['name'] + ', '
                
                f.write(f'{track['track']['name']}, {track['track']['album']['name']} - {artistNames}\n')
                size += 1

                print(f'{track['track']['name']}, {track['track']['album']['name']} - {artistNames}')
                print(f"saved song progress {size}/{playlistInfo['tracks']['total']}" )
            
            f.close()        
            return path

    print('playlist(toText) endpt - error')
    return 'error'

#errs 
#   query failure
@app.get('/playlist/{playlistID}', summary="Returns information on user playlist")
def playlist(
    response: Response,
    userCred: Annotated[userCredCookies, Cookie()], 
    playlistID: str):

    print(f'playlist {playlistID} endpt')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            playlistInfo = querySpotify(accessTok, expTime, f'playlists/{playlistID}')
        else:
            playlistInfo = querySpotify(userCred.access_token, userCred.expire_time, f'playlists/{playlistID}')
    
        if playlistInfo['status'] == 'success':
            return playlistInfo

    print(f'playlist {playlistID} endpt - error')    
    return 'error'

#errs 
#   query failure
#   bad resp
@app.post('/toListenTo', summary="Adds track to toListenTo playlist") 
def addtoListenTo(response: Response, userCred: Annotated[userCredCookies, Cookie()], songURI: Annotated[str, Body()]):
    
    print('toListenTo post endpt','\tadding: ', songURI)
    toListenTo = ''
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            playlistInfo = querySpotify(accessTok, expTime, 'me/playlists?limit=50')        
        else:
            playlistInfo = querySpotify(userCred.access_token, userCred.expire_time, 'me/playlists?limit=50')

        if playlistInfo['status'] == 'success':        
            while (playlistInfo['next']):   #finding toListenTo
                for playlist in playlistInfo['items']:
                    if (playlist["description"] == 'toListenTo'):
                        toListenTo = playlist['id']
                        break           
                resp = requests.get(playlistInfo['next'], headers={'Authorization': 'Bearer '+ userCred.access_token})
                if 199 < resp.status_code < 300:
                    playlistInfo = resp.json()
                else:
                    break
                    #error 

            if (toListenTo == ''): #creating playlist
                userID = querySpotify('me')['id']  
                res = requests.post(
                    url= API_BASE_URL+f'users/{userID}/playlists', 
                    json={
                        "name":"toListenTo",
                        "description":"toListenTo",
                        "public":False
                    },
                    headers={'Authorization': 'Bearer '+ userCred.access_token}
                )

                if (199 < res.status_code < 300):
                    toListenTo = res.json()['id']
                    print("created: ", toListenTo)
                # else:   #error
        
            
            print("adding to:", toListenTo)
            if (toListenTo != ''):  # add song to playlist 
                resp = requests.post(
                    url=API_BASE_URL+f'playlists/{toListenTo}/tracks', 
                    json= {"uris": [songURI]}, 
                    headers={'Authorization': 'Bearer '+ userCred.access_token}
                )
                if (199 < resp.status_code < 300):
                    return {"status":"success", "id": toListenTo}
                # else: # errror

    print('post toListenTo endpt - error')
    return "error"

#errs 
#   query failure
#   bad resp
@app.get('/toListenTo', summary='Returns Information for toListenTo playlist')
def getToListenTo(response:Response, userCred: Annotated[userCredCookies, Cookie()],):

    print('toListenTo get endpt')
    toListenTo = ''
    if userCred.access_token and userCred.refresh_token and userCred.expire_time:
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            playlistInfo = querySpotify(accessTok, expTime, 'me/playlists?limit=50')
        else:
            print('cookie querry')
            playlistInfo = querySpotify(userCred.access_token, userCred.expire_time, 'me/playlists?limit=50')

        if playlistInfo['status'] == 'success':  
            while (playlistInfo['next']):   #finding toListenTo
                for playlist in playlistInfo['items']:
                    if (playlist["description"] == 'toListenTo'):
                        toListenTo = playlist['id']
                        break           
                
                resp = requests.get(
                    playlistInfo['next'], 
                    headers={'Authorization': 'Bearer '+ userCred.access_token }
                )
                if 199 < resp.status_code < 300:
                    playlistInfo = resp.json()
                else:
                    raise HTTPException(status_code=500, detail='Server Request Error')
    
            if (toListenTo == ''):  #creating playlist
                userID = querySpotify('me')['id']
                if playlistInfo['status'] == 'success':   
                    resp = requests.post(
                        url= API_BASE_URL+f'users/{userID}/playlists', 
                        json={
                            "name":"toListenTo",
                            "description":"toListenTo",
                            "public":False
                        },
                        headers={'Authorization': 'Bearer '+ userCred.access_token}
                    )
                    if (199 < resp.status_code < 300):
                        toListenTo = resp.json()['id']
                        print("created: ", toListenTo)

            if toListenTo:
                return {"id": toListenTo, 'status': 'success'}

    
    # raise HTTPException(status_code=500, detail="Error getting toListenTo playlist id")
    print('getToListenTo endpt - error')
    return "error"



def itemTypeValidator(type):
    types = {'track'}
    return type in types

#errs 
#   query failure
@app.get('/search', summary="Returns search results of search string")
def search(
    response: Response, 
    userCred: Annotated[userCredCookies, Cookie()], 
    searchstr: str, 
    itemType: str = "track", 
    offset: Annotated[int, Query(ge=0)] = 0):

    print('search endpt')
    if userCred.access_token and userCred.refresh_token and userCred.expire_time and itemTypeValidator(itemType):
        if datetime.fromisoformat(userCred.expire_time) <= datetime.now():
            print('refesh querry')
            accessTok, expTime = refreshToken(userCred.refresh_token)
            response.set_cookie(key='access_token', value=accessTok)
            response.set_cookie(key="expire_time", value=expTime)

            itemInfo = querySpotify(accessTok, expTime, f'search?q={searchstr}&type={itemType}&limit=50&offset={offset}')
        else:
            itemInfo = querySpotify(userCred.access_token, userCred.expire_time, f'search?q={searchstr}&type={itemType}&limit=50&offset={offset}')
    
        if itemInfo['status'] == 'success':
            return itemInfo
    
    # raise HTTPException(status_code=500, detail='Error getting Search Results')
    print('search endpt - error')
    return "error"


if __name__ == "__main__":
    print("Note: .env loads once per run")
    uvicorn.run(app, port=5000)
    #temporary reset auth