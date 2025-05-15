
export default function ArtistCard({artist, }) {
    //console.log(artist)

    var res = ''
    //breaks on 2 genre artist case
    if (typeof artist != 'undefined' && typeof artist.genres != undefined){
        for (var i in artist.genres) {
            if (i == 0 || i == artist.genres.length) res = res + artist.genres[i];
            else res = res + ', ' + artist.genres[i];
        }
    }
    const genresStr = res
    

    return(
        <> 
            <div>
                <img src = { 
                        artist.images.length == 3 ? 
                            artist.images[2].url 
                            :null
                    
                } 
                alt={`${artist.name} profile photo`} />
            </div>
            <div>
                <a href={artist.external_urls.spotify}>
                    <h3>{artist.name}</h3>
                </a>
                {/* <h6>({artist.type})</h6> */}
                
                <h4>Info</h4>
                <p>Genres: {genresStr}</p>
                <p>General Popularity: {artist.popularity}/100</p>
                <p>Followers: {artist.followers.total}</p>
            </div>
        </>
    )
}