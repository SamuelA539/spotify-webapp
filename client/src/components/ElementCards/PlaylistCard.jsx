import '../../styles/PlaylistCard.css'

//component for displaying a Playlist
export default function PlaylistCard({playlist, size=150}) {
    
    if (playlist.images) {
        playlist.images.sort((a,b) => a.height-b.height) //check objs are real images
        
        var bestImg = playlist.images[0];
        for (var i of playlist.images) {
            if (size - bestImg.height > size - i.height) bestImg = i;
        }
    }

    return (
        <section>  
            <div className='playlistInfo'>
                <img 
                    src={bestImg ? (bestImg.url) : null} 
                    alt={`${playlist.description} Playlist Cover`}
                    height={size}
                    width={size}
                > </img>
                <div>
                    <a href={playlist.external_urls.spotify} target="_blank"><h3>{playlist.name}</h3></a>
                    <h5>Num Tracks: {playlist.tracks.total}</h5>
                    <h6>Visibility: {playlist.public ? 'Public': 'Private'}</h6>
                </div>
            </div>
            
            <div className='descriptionDiv'>
                <h6>Desription:</h6>
                <p>{playlist.description == '' ? 'N/A':playlist.description}</p>
            </div>
        </section>
    )

}