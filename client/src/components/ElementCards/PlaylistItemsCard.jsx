import "../../styles/PlaylistItems.css"

import { useEffect, useState } from "react"
import TrackCard from "./TrackCard";
import { DataError, FetchError } from "../Supporting/Errors";


export default function PlaylistItemsCard({id, toText = true}) {
    const [errFlg, setErrFlg] = useState({});

    const[offset, setOffset] = useState(0);
    const [playlistTracks, setPlaylistTracks] = useState([]);
    const [playlistName, setPlaylistName] = useState('');


//gets playlistInfo
    useEffect( () => {
        if (id != ''){
            fetch(`http://localhost:5000/playlist/${id}`, {credentials: 'include'})
            .then(res => {
                res.json()
                .then(data => {
                    console.log('playlist items card-playlist info: ', data)
                    if (data.status == "success") {     
                        setPlaylistTracks(data.tracks)
                        setPlaylistName(data.name)
                    } else throw Error('Bad resp data');
                })
                .catch(err => {
                    console.warn('Data Error - getting playlist info: ', err)
                    setErrFlg({
                        status: true,
                        errType: 'data', 
                        msg: 'Error Getting Playlist Info'
                    })
                })
            }).catch(err => {
                console.warn('Fetch Error - getting playlist info: ', err)
                setErrFlg({
                    status: true,
                    errType: 'fetch', 
                    msg: 'Error Getting Playlist Info'
                })
            })
        }
    }, [])

//Downloads text file of playlist tracks
    //TODO error handle
    function handleToTextClick(elem){
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
                anch.download = playlistName
                anch.click()

                URL.revokeObjectURL(url)
                anch.remove()
            })
        ).catch(err => console.log('handleTestClick Error: ', err))
    }

    if (Object.keys(errFlg).length > 0 && errFlg.status) {
        switch(errFlg.errType) {
            case('data'):
                throw DataError(errFlg.msg)
                break
            case('fetch'):
                throw FetchError(errFlg.msg)
                break
        }
    }
    
    return( 
        <section id={`${id}-playlistItems`}>
            <ul>
                {typeof playlistTracks.items !== 'undefined' ? playlistTracks.items.map(t => 
                    <li id={`${t.track.id}Elem`} key={t.track.id}>
                        <TrackCard track={t.track} height={80} width={80}/>
                    </li>).slice(offset, offset+5) 
                    : null}
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