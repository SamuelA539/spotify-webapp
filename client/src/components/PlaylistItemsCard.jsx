import { useEffect, useState } from "react"


export default function PlaylistItemsCard({playlistData, playlistTracks}) {
    //get as inputs
    // console.log(playlistData)
    const[offset, setOffset] = useState(0);


    const[plalistItems, setPlaylistItems] = useState(playlistTracks.items == null ? {} : playlistTracks.items.map(trackInfo => 
        <div key={trackInfo.track.id}>
            <input type="checkbox" id={`${trackInfo.track.id} box`}  value={
                `${typeof trackInfo.track.name != 'undefined'? trackInfo.track.name : "track name error"} - 
                ${typeof trackInfo.track.album.name != 'undefined'?trackInfo.track.album.name : "album name error"}`}
                onChange={()=>{
                    var checkbox = document.getElementById(`${trackInfo.track.id} box`)
                    if(checkbox.checked) {
                        console.log(`${trackInfo.track.id} cheched`)
                        //function to save state of items
                        checkbox.checked="checked"
                    } else {
                        console.log(`${trackInfo.track.id} uncheched`)
                        checkbox.checked=""
                    }
                }}
            />

            <label>{
                ` ${typeof trackInfo.track.name != 'undefined'? trackInfo.track.name : "track name error"} - 
                 ${typeof trackInfo.track.album.name != 'undefined'?trackInfo.track.album.name : "album name error"}`}
            </label><br/>
        </div>
        ));

    //console.log('Tracks: ' ,playlistTracks)

    //split tracks to desired window ?5?
    if (playlistTracks.items != null) {
        
        return(
            <>
                {/* <h6>Playlist: {playlistData.name}</h6>
                <h6>Num Tracks: {playlistTracks.total}</h6> */}
                
                <form action="" method="post">
                    {plalistItems.slice(offset, offset+6)}
                    <button type="submit">toText</button>
                </form>

                <>
                    <>tracks: {offset} {offset+5 <= playlistTracks.total ? `- ${offset+5}` : `- ${playlistTracks.total}`} / {playlistTracks.total}</>  <br/>

                    {/* Buttons need work */}
                

                    {offset !== 0 ? 
                            <button onClick={() => 
                                setOffset(o => {
                                    //set checkedness of playlist checks
                                    setPlaylistItems( items => {

                                    })
                                    
                                    if (o-5 < 0) {
                                        //document.getElementById('test').innerHTML = 'offset same'
                                        return o
                                    }else {
                                        //document.getElementById('test').innerHTML = 'Added 5 to offset'
                                        return o-5; 
                                    }  
                                })
                            }>Prev</button>
                        : null }

                    { offset+5 < playlistTracks.total ? 
                        <button onClick={() => 
                            setOffset( o => {
                                if (o+5 > playlistData.total) {
                                    //document.getElementById('test').innerHTML = 'offset same'
                                    return o; 
                                }else {
                                    //document.getElementById('test').innerHTML = 'Added 5 to offset'
                                    return o+5  
                                }
                            })}>Next</button>                    
                        : null }
                </>
                <p id="test"></p>
            </>
        ) 
    }
    

    return(
        <>
            Technical Difficulties
        </>
    )

}