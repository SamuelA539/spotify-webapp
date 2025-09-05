import '../../styles/TrackCard.css'


export default function TrackCard({track, height, width}) {
    if (Object.keys(track).length > 0 ) {
        var artists = []
        if (typeof track != 'undefined' && typeof track.artists != undefined){
            for (var i in track.artists) artists.push(track.artists[i].name);    
        }
        const artistStr = artists.join(", ")

        //seting bestImg 
        if (typeof track.album != undefined) {
            track.album.images.sort((a,b) => b.height*b.width-a.height*a.width)
        }

        return(
            <div className="trackCard">
                <div>
                    <img src = { track.album.images.length > 0 ? track.album.images[0].url : null} 
                    alt={`${track.name}, ${track.album.name} cover`}
                    height={height}
                    width={width}/>
                </div>

                <div>
                    <a href={track.external_urls.spotify} target="_blank">  <h4>{track.name}</h4>   </a>
                    <a href={track.album.external_urls.spotify} target="_blank">    <h5>Album: {track.album.name}</h5>     </a>
                    <h5>by {artistStr}</h5>

                    <h6>Released: {track.album.release_date}</h6>
                    <h6>General Popularity: {track.popularity}</h6>
                </div>
            </div>
        )
    }
}