import { useEffect } from "react"
import '../styles/TrackCard.css'


export default function TrackCard({track, size=150}) {
    console.log(track)

    //seting artists var
    var res = ''
    if (typeof track != 'undefined' && typeof track.artists != undefined){
        for (var i in track.artists) {
            if (i == 0 || i == track.artists.length) res = res + track.artists[i].name;
            else res = res + ', ' + track.artists[i].name;
        }
    }
    const artistStr = res

    //seting bestImg 
    if (track.album.images) {
        track.album.images.sort((a,b) => a.height-b.height) //check objs are real images
        
        var bestImg = track.album.images[0];
        for (var i of track.album.images) {
            if (size - bestImg.height > size - i.height) bestImg = i;
        }
    }

    return(
        <div className="trackCard">
            <div>
                <img src = { bestImg ? bestImg.url : null} 
                alt={`${track.name}, ${track.album.name} cover`}
                height={size}
                width={size}/>
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