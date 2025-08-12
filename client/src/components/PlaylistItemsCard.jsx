import { use } from "react";
import { useEffect, useRef, useState } from "react"
import "../styles/PlaylistItems.css"


export default function PlaylistItemsCard({playlistData, id, toText = true}) {
    console.log('items id: ', id, id == '')
    const[offset, setOffset] = useState(0);
    const [playlistTracks, setPlaylistTracks] = useState([]);

    const [errFlg, setErrFlg] = useState(false);

    //gets playlistInfo
    useEffect( () => {
    if (id != ''){
        console.log('fetching')
        fetch(`http://localhost:5000/playlist/${id}`, 
            {
                credentials: 'include'
            }
        )
        .then(res => {
            res.json()
            .then(data => {
                console.log('playlist items card-playlist info: ', data)
                if (data.status == "success") {     
                    setPlaylistTracks(data.tracks)
                } else throw new Error('Bad resp');
            })
            .catch(err => {
                setErrFlg(true)
                throw Error('Playlist Fetch Error: ', err) 
            })
        }).catch(err => {
            setErrFlg(true)
            throw Error('Playlist Fetch Error: ', err)
        })
    }
    }, [])

    //make to effect
    function handleToTextClick(elem){
        console.log(elem.target)
        let id = elem.target.id.slice(0, -7)
        console.log('id: ', id)

        fetch(`http://localhost:5000/playlist/toText/${id}`, 
            {
                credentials: 'include'
            }
        )
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

    //split tracks to desired window ?5?
    if (errFlg) throw Error('Playlist Items Card Error')
    return( 
        <section id={`${id}-playlistItems`}>
            <ul>
                {typeof playlistTracks.items !== 'undefined' ? playlistTracks.items.map(t => 
                    <li id={`${t.track.id}Elem`} key={t.track.id}>
                        {
                            `${typeof t.track.name != 'undefined'? t.track.name : "track name error"} - 
                                ${typeof t.track.album.name != 'undefined'?t.track.album.name : "album name error"}`
                        }
                        {/* <button id={`${t.track.id} btn`} onClick={handleAddClick}>Add</button> */}
                    </li>)
                    .slice(offset, offset+5) : null
                }
            </ul>   
            
            <section className="playlistBtns">
                <span>    
                    <button onClick={() => 
                        setOffset(o => o-5 < 0 ? o : o-5)}>Prev</button>
                    <button onClick={() => 
                        setOffset( o => o+5 > playlistTracks.total ? o : o+5)}>Next</button>
                    {`${offset+1} - 
                        ${offset+5 > playlistTracks.total ? playlistTracks.total: 5+offset} 
                        of ${playlistTracks.total}`} 
                </span>  
                
                {toText ? <button
                    id={`${id}-toText`}
                    // className="btn btn-primary"
                    onClick={handleToTextClick}>ToText
                </button> : null}
            </section>
        </section>
    );
}