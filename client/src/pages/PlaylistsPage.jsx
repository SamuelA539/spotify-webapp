import { useEffect, useState, createElement, useRef } from "react";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistItemsCard from "../components/PlaylistItemsCard";
import LoadingPage from "./LoadingPage";
import NavBtns from "../components/NavBtns";

//useTranstion on list
//toText hidden if no value state or ref set when playlist selected

export default function PlaylistsPage() {
    const [totalPlaylists, setTotalPlaylists] = useState(0) //dosent need to be state(just param in json)
    const [playlistOffset, setPlayliistOffset] = useState(0)
    const [playlists, setPlaylists] = useState([])


    const [playlistID, setPlaylistID] = useState('')

    const [errFlg, setErrFlg] = useState(false)

    //set each render?
    // const toTextLinkRef = useRef('')//useRef(getToTextURL(playlistInfo))
    const [textLink, setTextLink] = useState('')

//gets playlists
    useEffect( ()=> {
        fetch(`http://localhost:5000/playlists?offset=${playlistOffset}`, 
            {
                credentials: 'include'
            })
        .then(res => {
            res.json()
            .then(data => {
                // console.log('playlist page-playlist: ', data)
                if (data.status == "success") { 
                    setTotalPlaylists(data.total)
                    setPlaylists(data.items)
                }else throw Error('Bad resp');
            })
            .catch( err => {
                console.warn('Data Error - getting playlists: ', err)
                setErrFlg(true)
            });
        })  
        .catch(err => {
            console.warn('Fetch Error - getting playlists: ', err)
            setErrFlg(true)
        })
    },[playlistOffset]);

//shows&hides playlists tracks
    function handlePlaylistTracksClick(elem) {
        let id = elem.target.id.slice(0, -10)
        let content = document.getElementById(`${id} tracks`)

        console.log('showing playlist: ',id)
        if (elem.target.innerHTML == "See Tracks"){
            setPlaylistID(id)    
            content.hidden = false
            elem.target.innerHTML = "Close Tracks"
        } else {  
            content.hidden = true
            elem.target.innerHTML = "See Tracks"  
        }
    }

    if (errFlg) throw Error('Playlist Page');
    return (
        <article>
            <section id="playlistsPageInfo" className="text-center">
                <h2>Playlists Page</h2>
                <h4 >Total Plalists: {totalPlaylists}</h4>
            </section>  <br/><hr/>

            <NavBtns id="topNavBtns"
                pageSize={50}
                offset={playlistOffset}
                total={totalPlaylists}
                fwrdFn={() => {
                    setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                }}
                bckwrdFn={()=> {
                    setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                }}
            />
            
            <section id="playlistsList">
                <ul className="list-group">
                    {playlists.length > 0 ? playlists.map( (playlist) =>
                        <li key={playlist.id} className="list-group-item">                         
                            
                            <PlaylistCard playlist={playlist}/> <hr/>
                            
                            <div id={`${playlist.id}-ctrlBtn`}>  
                                <button 
                                    id={`${playlist.id}-tracksBtn`} 
                                    onClick={handlePlaylistTracksClick} 
                                    className="btn btn-primary">See Tracks</button>
                            </div>
                            
                            <div id={`${playlist.id} tracks`} >
                                {playlist.id == playlistID //&& document.getElementById("itemsBtn").innerHTML == 'Close' Broken 
                                ? <PlaylistItemsCard id={playlistID}/> : null}
                            </div>
                        </li>
                    ) : "Error Getting Playlists"}
                </ul>   
            </section> 
            
             <NavBtns id="btmNavBtns"
                pageSize={50}
                offset={playlistOffset}
                total={totalPlaylists}
                fwrdFn={() => {
                    setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                }}
                bckwrdFn={()=> {
                    setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                }}
            />

        </article>
    )

}