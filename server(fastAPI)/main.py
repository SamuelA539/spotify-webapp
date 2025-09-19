import uvicorn
from typing import Annotated
from fastapi import FastAPI, Response, HTTPException, Cookie, Body, Query #Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from pydantic import BaseModel, AfterValidator
from datetime import datetime

# from app import exceptions
import base64, os, requests 
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

#TODO configure 
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


class User():
    def __init__(self, name, url, follower_count, user_id, images, uri):
        self.name = name
        self.url = url
        self.follower_count = follower_count
        self.images = images 
        
        self.id = user_id
        self.uri = uri
    
    def __str__(self):
        return (f"User - name: {self.name} id: {self.id}\t" + 
                f"[followerCount: {self.follower_count} url: {self.url} uri: {self.uri}]")
        
def createUser(user_info):
    # print('creating user: ', user_info)
    user = User(
        name = user_info['display_name'],
        url = user_info['external_urls']['spotify'],
        follower_count = user_info['followers']['total'],
        images = user_info['images'], 
        user_id = user_info['id'],
        uri = user_info['uri'],
    )
    print(user)
    return user

#TODO slim ablum[images, url, name, release date, id, uri] and artist[url, name, id, uri] objs
class Track():
    def __init__(self, name, popularity, track_id, explicit, add_date, uri, url, album=None, artists=None):
        self.name = name
        self.popularity = popularity
        self.id = track_id
        self.explicit = explicit
        self.add_date = add_date
        self.album = album
        self.artists = artists
        self.url = url
        
        self.uri = uri
    
    def __str__(self):
        return (f"Track: {self.name}, {self.album}-{self.artists}\t" +
                f"[date: {self.add_date} popularity: {self.popularity} explicit:{self.explicit} uri:{self.uri} id:{self.id} url: {self.url}]")

def createTrack(track_info, add_date=None):
    # print('creating track: ', track_info)
    track_info['album'].pop("available_markets")
    track = Track(
        name = track_info['name'],
        popularity = track_info['popularity'],
        track_id = track_info['id'],
        explicit = track_info['explicit'],
        add_date = add_date,
        uri = track_info['uri'],
        url = track_info['external_urls']['spotify'],
        album = track_info['album'],
        artists = track_info['artists']
    )
    # print(track)
    return track

class Artist():
    def __init__(self, name, url, genres, follower_count, images, popularity, artist_id, uri):
        self.name = name
        self.url = url
        self.follower_count = follower_count
        self.genres = genres
        self.images = images
        self.popularity = popularity

        self.id = artist_id
        self.uri = uri
    
    def __str__(self):
        return (f"Artist: {self.name}" 
                + f"[genres: {self.genres} popularity: {self.popularity} uri: {self.uri} id: {self.id}")

def createArtist(artist_info):
    # print('creating artist: ', artist_info)
    artist = Artist(
        name = artist_info['name'],
        url = artist_info['external_urls']['spotify'],
        follower_count = artist_info['followers']['total'],
        genres = artist_info['genres'],
        images = artist_info['images'],
        popularity = artist_info['popularity'],
        artist_id = artist_info['id'],
        uri = artist_info['uri']
    )
    # print(artist)
    return artist
    
#TODO format
class Album():
    def __init__(self, name, num_tracks, release, album_type, popularity, images, url, artists, tracks, uri, album_id):
        self.name = name
        self.num_tracks = num_tracks
        self.release = release
        self.type = album_type
        self.popularity = popularity
        self.images = images
        self.url = url

        self.artists = artists
        self.tracks = tracks
        
        self.uri = uri
        self.id = album_id
    
    def __self__(self):
        return (f"{self.name}-{self.artists}" 
                + f"[tracknum: {self.num_tracks} release: {self.release} type: {self.type} popularity: {self.popularity} uri: {self.uri} id: {self.id}]")

def createAlbum(album_info):
    print('creating album: ', album_info)

class Playlist():
    def __init__(self, name, description, owner, tracks, primary_color, public, collaborative, url, images, uri, playlist_id):
        self.name = name
        self.description = description
        self.owner = owner #simple user
        self.tracks = tracks #array of tracks
        self.public = public
        self.collaborative = collaborative
        self.url = url
        self.images = images
        self.primary_color = primary_color
        self.uri = uri 
        self.id = playlist_id

    def __str__(self):
        return (f"Playlist: {self.name}-{self.owner}" 
                + f"[description: {self.description} public: {self.public} collaborative: {self.collaborative} id: {self.id} uri: {self.uri}]")

def createPlaylist(playlist_info):
    # print('creating playlist: ', playlist_info)
    playlist = Playlist(
        name = playlist_info['name'],
        description = playlist_info['description'],
        owner = playlist_info['owner'], #user obj?
        tracks = playlist_info['tracks'],
        public = playlist_info['public'],
        collaborative = playlist_info['collaborative'], 
        url = playlist_info['external_urls']['spotify'],
        primary_color = playlist_info['primary_color'],
        images = playlist_info['images'],
        uri = playlist_info['uri'],
        playlist_id = playlist_info['id']
    )
    # print(playlist)
    return playlist





#   ---   functions   ---



#checks access token expirery in evironment variabes
def checkAccessToken(expTime: str  = ''):
    expireTime = expTime if expTime else os.getenv('Expire_Time')
    if expireTime:
        accessTokenTime = datetime.fromisoformat(expireTime)
        return accessTokenTime >= datetime.now()
    raise HTTPException(status_code=500, detail="Server Initalization Error")

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
def refreshToken(refreshToken: str =''):
    refreshTkn = refreshToken if refreshToken else os.getenv('Refresh_Token')
    if refreshTkn: # can be refreshed 
        if not checkAccessToken(): # needed? double checks if accessToken valid
            response = requests.post(
                TOKEN_URL, 
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token':refreshTkn,
                    'client_id': os.getenv("client_id"),
                    'client_secret': os.getenv("client_secret")
                }, 
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            if 199 < response < 400:
                newTokenInfo = response.json() 
                if 'access_token' in newTokenInfo:
                    accessTokenTime = datetime.now().timestamp() + newTokenInfo['expires_in']
                    #TODO return vals for cookies
                    os.putenv('Access_Token', newTokenInfo['access_token']) 
                    os.putenv('Expire_Time', datetime.fromtimestamp(accessTokenTime) ) 
                    return True
            raise HTTPException(status_code=500, detail="Bad Server Refresh Request Response")
        else:
            return True #no token refresh needed 
    raise HTTPException(status_code=500, detail="Server Initalization Error")

#querys spoitfy api 
    #TODO make Cookie based
#errs 
#   bad response
#   auth prob
def querySpotify(endpoint: str = ''): 
    print('Querying')
    if endpoint and checkAccessToken():
        response = requests.get(
            f"{API_BASE_URL}{endpoint}", 
            headers={
                'Authorization': 'Bearer '+ os.getenv('Access_Token', default='')
            }
        )
        
        if 199 < response.status_code < 300: 
            info = response.json()
            info.update({'status':'success'})
            return info
        else:  
            return {"status":'error'}   
    else:   #token error ||  endpoint type error
        return {"status":'error'}         
        


#   --- endpoints ---   
#test page
@app.get("/")
def read_root():
    return "test"





#---    Spotify Account Endpoints   ---


#errs
#   init app cred
@app.get("/login", summary="Logs into spotify")
def login():
    print('login endpt')
    if setSecrets():
        return RedirectResponse(f"{AUTH_URL}?response_type=code&client_id={os.getenv('client_id')}&scope={scope}&redirect_uri={REDIRECT_URI}&show_dialog=True")
    return 'error'

#errs 
#   bad resp - no auth code
#   bad reso - auth token info
#   bad query/app init err - no usr dir
#TODO test

@app.get("/callback/", summary="Callback endpoint for spotify Login")
def callback(code: str | None = None):
    print('callback endpt')
    
    if not code:
        'error'

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
        
        response = RedirectResponse('http://localhost:5137/home')
    #TODO integrate Cookies
        # maxAge = 60*60*24*7
        # response.set_cookie(key='access_token', value=str(token_info['access_token']), max_age=maxAge)
        # response.set_cookie(key='refresh_token', value=str(token_info['refresh_token']), max_age=maxAge)
        # response.set_cookie(key="expire_time", value=str(datetime.fromtimestamp(accessTokenTime)), max_age=maxAge)

        #makeUser specific dir (if not exists )
        exists = False
        usrQuery = querySpotify('me')
        if usrQuery['status'] == 'success':
            usrID = usrQuery['id']

            for dir in os.scandir():
                if (dir.name == usrID):
                    exists = True

            if (not exists):
                os.mkdir(usrID)
        
            return response
        #no usr dir - no toText
    return 'error'

#TODO errs in helper functions
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
    resp = RedirectResponse(frontendURL)
    resp.delete_cookie("access_token")
    resp.delete_cookie("refresh_token")
    resp.delete_cookie("expire_time")
    
    print('log out success')
    return resp



#---    User Info Endpoints   ---
   #TODO: http Errors [exceptions on failed queries]

def termValidator(term:str):
    terms = {'short', 'medium', 'long'}
    return (term in terms)

#errs 
#   query failure
@app.get('/user', summary="Returns user's profile info")
def user(userCred: Annotated[userCredCookies, Cookie()]): 
    print('user endpt')
    print('user cred cookies:', userCred)
    userInfo = querySpotify('me')

    if userInfo['status'] == 'success':
        return {'user': createUser(userInfo), 'logged': 'true', 'status': 'success'}
    else:
        print(userInfo)
        return 'error'

#errs 
#   query failure
@app.get('/savedSongs', summary="Returns user's saved songs")
def savedSongs(offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('savedSongs endpt')
    savedSongs = querySpotify(f'me/tracks?offset={offset}&limit={limit}')

    if savedSongs['status'] == 'success' and savedSongs:
        saved_songs = []
        for track in savedSongs['items']:
            saved_songs.append(createTrack(track['track'], track['added_at']))
        
        return {'tracks':saved_songs, 'status':'success', 'total': savedSongs['total']}
    else:
        return 'error'

#TODO can send progress to client?
#errs 
#   query failure
#   bad resp
@app.get('/savedSongs/toText', response_class=FileResponse, summary="Returns text file of users saved songs")
def savedSongsToText():
    print('\nsaved songs toText')
 
    userInfo = querySpotify('me')
    if userInfo['status'] == 'success': #creating file of saved songs
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
                # print('next url: ', nextTracks)
            else:   #error   
                print('error loading tracks ', resp.status_code)
                nextTracks = None
        f.close()

        print('Songs Saved: ', size)
        return path
    return 'error'

#errs 
#   query failure
@app.get('/topArtists', summary="Returns users's top artists")
def topArtists(term: str='medium', offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('topArtist endpt')
    
    if termValidator(term):
        topArtists = querySpotify(f'me/top/artists?time_range={term}_term&limit={limit}&offset={offset}')
    if topArtists and topArtists['status'] == 'success':
        top_artists = []
        for artist in topArtists['items']:
            top_artists.append(createArtist(artist))
        return {'artists': top_artists, 'status': 'success', 'total': topArtists['total']}
    
    return 'Error'

#errs 
#   query failure
@app.get('/topTracks', summary="Returns users's top tracks")
def topTracks(term: str='medium', offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('topTracks endpt')
    
    if termValidator(term):
        topTracks = querySpotify(f'me/top/tracks?time_range={term}_term&limit={limit}&offset={offset}')
    if topTracks and topTracks['status'] == 'success':
        top_tracks = []
        for track in topTracks['items']:
            top_tracks.append(createTrack(track))
        return {'tracks': top_tracks, 'total': topTracks['total'], 'status': 'success'}
    
    return 'Error'


#---    Playlist Endpoint    ---
    #TODO: http Errors [exceptions on failed queries]
#errs 
#   query failure
@app.get('/playlists', summary="Returns user's playlists")
def playlists(offset: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=15, le=50)] = 50):
    print('playlist endpt')
    playlistsInfo = querySpotify(f'me/playlists?offset={offset}&limit={limit}')

    if playlistsInfo['status'] == 'success':
        playlists = []
        for playlist in playlistsInfo['items']:
            playlists.append(createPlaylist(playlist))
        
        return {'playlists': playlists, 'status': 'success', 'total': playlistsInfo['total']}

    return 'error'

#check spotify playlist id restrictions for path checks
#TODO dont use makefile function
@app.get('/playlist/toText/{playlistID}', response_class=FileResponse, summary="Returns text file of tracks in user's playlists")
def toText(playlistID: str):
    print(f'\n---toText {playlistID} endpt---\n')
    playlistInfo = querySpotify(f'playlists/{playlistID}')
    userInfo = querySpotify('me')
        
    if playlistInfo['status'] == 'success' and userInfo['status'] == 'success' and playlistInfo['tracks']:
        path = f"{userInfo['id']}/{playlistInfo['name']}.txt"
        f = open(path, 'w')
        f.write("Format: Song, album - artists \n\n")
        for track in playlistInfo['tracks']:
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
            print(f"saved song progress {size}/{playlistInfo['total']}" )
        f.close()        
        return path
    
    return 'error'

#errs 
#   query failure
@app.get('/playlist/{playlistID}', summary="Returns information on user playlist")
def playlist(playlistID: str):
    print(f'playlist {playlistID} endpt')

    playlistInfo = querySpotify(f'playlists/{playlistID}')
    if playlistInfo['status'] == 'success':
        createPlaylist(playlistInfo)
        return playlistInfo
    
    return 'Error'

#errs 
#   query failure
#   bad resp
@app.post('/toListenTo', summary="Adds track to toListenTo playlist") 
def addtoListenTo(songURI: Annotated[str, Body()]):
    print('toListenTo post endpt')
    print('adding: ', songURI)

    toListenTo = '' # add to file for fast access on second time
    playlistInfo = querySpotify('me/playlists?limit=50')

    if playlistInfo['status'] == 'succes':        
    
        while (playlistInfo['next']):   #finding toListenTo
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

        if (toListenTo == ''): #creating playlist
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
    
        print("adding to:", toListenTo)
        if (toListenTo != ''):  # add song to playlist 
            resp = requests.post(
                url=API_BASE_URL+f'playlists/{toListenTo}/tracks', 
                json= {"uris": [songURI]}, 
                headers={'Authorization': 'Bearer '+ os.getenv('Access_Token')}
            )
            if (199 < resp.status_code < 300):
                return {"status":"success", "id": toListenTo}
            # else: # errror

    return "error"

#errs 
#   query failure
#   bad resp
@app.get('/toListenTo', summary='Returns Information for toListenTo playlist')
def getToListenTo():
    print('toListenTo get endpt')

    toListenTo = ''
    playlistInfo = querySpotify('me/playlists?limit=50')
    
    if playlistInfo['status'] == 'success':  

        while (playlistInfo['next']):   #finding toListenTo
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
   
        if (toListenTo == ''): #creating playlist
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

#errs 
#   query failure
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