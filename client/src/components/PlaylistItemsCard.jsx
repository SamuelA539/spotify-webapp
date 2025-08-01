import { use } from "react";
import { useEffect, useRef, useState } from "react"
import "../styles/PlaylistItems.css"


export default function PlaylistItemsCard({playlistData}) {
    const[offset, setOffset] = useState(0);
    const playlistSelections = useRef([]); //holds playlist ids on submit post

    //make to effect
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
    if (playlistData.tracks.items)
        return(
            <section id={`${playlistData.name}-playlistItems`}>
                <ul>
                    {playlistItems.slice(offset, offset+5)}
                </ul>   
                
                <section className="playlistBtns">
                <span>    
                    <button onClick={() => setOffset(o => o-5 < 0 ? o : o-5)}>Prev</button>
                    <button onClick={() => setOffset( o => o+5 > playlistData.total ? o : o+5)}>Next</button>
                    {`${offset+1} - 
                        ${offset+5 > playlistData.tracks.total ? playlistData.tracks.total: 5+offset} 
                        of ${playlistData.tracks.total}`} 
                </span>  
                <button
                    id={`${playlistData.id}-toText`}
                    // className="btn btn-primary"
                    onClick={handleToTextClick}>ToText</button>
                </section>
            </section>
        );

}