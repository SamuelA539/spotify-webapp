import '../../styles/ArtistCard.css'

export default function ArtistCard({artist, size=150}) {
    var res = ''
    if (typeof artist != 'undefined' && typeof artist.genres != undefined){
        for (var i in artist.genres) {
            if (i == 0 || i == artist.genres.length) res = res + artist.genres[i];
            else res = res + ', ' + artist.genres[i];
        }
    }
    const genresStr = res
    
    //seting bestImg 
    if (artist.images) {
        artist.images.sort((a,b) => a.height-b.height) //check objs are real images
        
        var bestImg = artist.images[0];
        for (var i of artist.images) {
            if (size - bestImg.height > size - i.height) bestImg = i;
        }
    }

    return(
        <div className='artistCard'> 
            <div>
                <img src = {bestImg ? bestImg.url : null} 
                alt={`${artist.name} profile photo`} 
                height={size}
                width={size}/>
            </div> 
            <div>
                <a href={artist.external_urls.spotify}><h3>{artist.name}</h3></a>
                {/* <h6>({artist.type})</h6> */}
                
                <h4>Info</h4>
                <h5>Genres: {genresStr}</h5>
                <h6>General Popularity: {artist.popularity}/100</h6>
                <h6>Followers: {artist.followers.total}</h6>
            </div>
        </div>
    )
}