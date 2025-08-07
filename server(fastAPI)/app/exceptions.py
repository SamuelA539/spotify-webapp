class SpotifyAppAPIError(Exception):
    '''
    base exception for application'
    message - text to indicate error
    name - name of endpoint where error occured 
    '''
    def __init__(self, message: str = "", name: str = "Sam's Spotify App" ):
        self.message = message
        self.name = name
        super().__init__(self.message, self.name)

#bad auth
class BadAuthError(SpotifyAppAPIError):
    '''Exception for authentication error from spotify api'''
    pass

# query err
class QuerryError(SpotifyAppAPIError):
    '''Exception for unsucessfuly query of spotify API'''
    pass

# bad resp
class ResponseError(SpotifyAppAPIError):
    '''Exception for bad responses'''

# app initalization
class AppInitError(SpotifyAppAPIError):
    '''Exception for server error'''
