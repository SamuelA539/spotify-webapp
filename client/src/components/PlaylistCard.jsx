//component for displaying each Playlist

//RENAME

export default function PlaylistCard({playlist}) {
    //props atrbs: playlist{ name, owner, description, url, images, numTracks, visibility}

    return (
        <section>  
            <div>
                <a href={playlist.external_urls.spotify} target="_blank"><h3>{playlist.name}</h3></a>
                <img 
                src={playlist.images !== null ? (playlist.images.length === 3 ? playlist.images[2].url : null) : null} 
                alt={`${playlist.description} Playlist Cover`}>
                </img>
            </div>

            <div>
                <h5>Num Tracks: {playlist.tracks.total}</h5>
                <h6>Visibility: {playlist.public ? 'Public': 'Private'}</h6>
            </div>  <hr/>

            <div>
                <h6>Desription:</h6>
                <p>{playlist.description == '' ? 'N/A':playlist.description}</p>
            </div>
        </section>
    )

}

