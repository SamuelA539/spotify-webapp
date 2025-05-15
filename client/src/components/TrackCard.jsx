import { useEffect } from "react"

export default function TrackCard({track, }) {
    //console.log(track)

    var res = ''
    //breaks on 2 genre artist case
    if (typeof track != 'undefined' && typeof track.artists != undefined){
        for (var i in track.artists) {
            if (i == 0 || i == track.artists.length) res = res + track.artists[i].name;
            else res = res + ', ' + track.artists[i].name;
        }
    }
    const artistStr = res

    return(
        <>
            <div>
                <img src = { 
                    track.album.images.length == 3 ? 
                        track.album.images[2].url :
                        null
                } 
                alt={`${track.name}, ${track.album.name} cover`}/>
            </div>

            <div>
                <a href={track.external_urls.spotify}>  <h4>{track.name}</h4>   </a>
                <a href={track.album.external_urls.spotify}>    <h5>Album: {track.album.name}</h5>     </a>
                <h5>by {artistStr}</h5>

                <h6>Released: {track.album.release_date}</h6>
                <h6>General Popularity: {track.popularity}</h6>
            </div>
        </>
    )
}