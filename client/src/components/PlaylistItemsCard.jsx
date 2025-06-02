import { use } from "react";
import { useEffect, useRef, useState } from "react"


export default function PlaylistItemsCard({playlistData}) {
    const[offset, setOffset] = useState(0);
    const playlistSelections = useRef([]); //holds playlist ids on submit post

    function handleToTextClick(elem){
        console.log(elem.target)
        let id = elem.target.id.slice(0, -7)
        console.log('id: ', id)

        fetch(`http://localhost:5000/playlist/toText/${id}`)
        .then(res => res.blob().then( blob => {
                console.log(blob)
                let url = URL.createObjectURL(blob);    console.log(url)
                var anch = document.createElement('a')
                anch.href = url
                anch.download = playlistData.name
                anch.click()

                URL.revokeObjectURL(url)
                anch.remove()
            })
        ).catch(err => console.log('handleTestClick Error: ', err))

    }

    //list of items
    var playlistItems =  playlistData.tracks.items.map(t => 
        <li id={`${t.track.id}Elem`} key={t.track.id}>
            {
                `${typeof t.track.name != 'undefined'? t.track.name : "track name error"} - 
                    ${typeof t.track.album.name != 'undefined'?t.track.album.name : "album name error"}`
            }
            {/* <button id={`${t.track.id} btn`} onClick={handleAddClick}>Add</button> */}
        </li>
    );

    //split tracks to desired window ?5?
    if (playlistData.tracks.items != null)
        return(
            <section id={`${playlistData.name}-playlistItems`}>
                {/* <h6>Playlist: {playlistData.name}</h6>
                <h6>Num Tracks: {playlistTracks.total}</h6> */}
                
                <ul>
                    {playlistItems.slice(offset, offset+6)}
                    {/* <a> 
                        <button onClick={handleToTextClick}>toText</button>
                    </a> */}
                </ul>   
                
                <hr/>

                {/* Nav Elems (btns & text) */}
                <section id={`${playlistData.name}-playlistItemsNavBtns`}>
                    <p>tracks: {offset} {offset+5 <= playlistData.tracks.total ? 
                        `- ${offset+5}` 
                        : `- ${playlistData.tracks.total}`} / {playlistData.tracks.total}</p>

                    {/* Buttons need work */}
                    {offset !== 0 ? 
                            <button onClick={() => 
                                setOffset(o => {     
                                    if (o-5 < 0) return o;
                                    else return o-5; 
                                })
                            }>Prev</button>
                        : null }

                    {offset+5 < playlistData.tracks.total ? 
                        <button onClick={() => 
                            setOffset( o => {
                                if (o+5 > playlistData.total) return o; 
                                else return o+5 ;
                                
                            })}>Next</button>                    
                        : null }
                </section> 
                
                <hr/> 
                
                <button
                    id={`${playlistData.id}-toText`}
                    className="btn btn-primary"
                    onClick={handleToTextClick}>ToText</button>

            </section>
        );
    
    return(
        <>
            Technical Difficulties
        </>
    )

}