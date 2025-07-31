import { useEffect, useState, createElement, useRef } from "react";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistItemsCard from "../components/PlaylistItemsCard";
import LoadingPage from "./LoadingPage";
import '../styles/PlaylistPage.css'

//useTranstion on list
//toText hidden if no value state or ref set when playlist selected

export default function PlaylistsPage() {
    const [totalPlaylists, setTotalPlaylists] = useState(0) //dosent need to be state(just param in json)
   
    const [playlistOffset, setPlayliistOffset] = useState(0)
    const [playlists, setPlaylists] = useState([])

    const [playlistInfo, setPlaylistInfo] = useState([])
    const [playlistID, setPlaylistID] = useState('')

    //set each rendee?
    // const toTextLinkRef = useRef('')//useRef(getToTextURL(playlistInfo))
    const [textLink, setTextLink] = useState('')

    //gets playlists
    useEffect( ()=> {
            fetch(`http://localhost:5000/playlists?offset=${playlistOffset}`)
            .then(res => {
                res.json()
                .then(data => {
                    console.log('data', data)

                    if (typeof data.items !== "undefined") { //only good case
                        setTotalPlaylists(data.total)
                        setPlaylists(data.items)
                    }else if (typeof data.detail !== "undefined" && data.detail.length > 0) { //api framwork err?
                        setErrFlg(true)
                        console.log(data.detail[0].msg)
                        //throw new Error(`data error: ${typeof data.detail[0].msg !== 'undefined' ? data.detail[0].msg : 'Unkown'}`);
                        //throw new Error('NOnononono')
                    }else { //other errs
                        setErrFlg(true)
                        //throw new Error('Gotta Problem Doc')
                    }
                })
                .catch( err => {
                    console.warn('Data Error:\n', err)
                    setErrFlg(true)
                });
            })  
            .catch(err => {
                console.warn('Fetch Error:\n', err)
                setErrFlg(true)
            })
        },[playlistOffset]);

    //gets playlistInfo
    useEffect( () => {
        if (playlistID != "") { 
            fetch(`http://localhost:5000/playlist/${playlistID}`)
            .then(res => {
                res.json()
                .then(data => {
                    if (typeof data.detail !== "undefined" && data.detail.length > 0){
                        console.log(data.detail[0].msg)
                        throw new Error(`data error: ${typeof data.detail[0].msg !== 'undefined' ? data.detail[0].msg : 'Unkown'}`);
                        //throw new Error('NOnononono')
                    } else if (data !== null) { //alt not empty check
                        console.log('playlist ',data)
                        setPlaylistInfo(data)
                        // setTextLink(getToTextURL(data.id))
                        //set blob url
                    } else {
                        throw new Error('Gotta Problem Doc')
                    }
                })
            }).catch(err => console.error('Playlist Fetch Error: ',err))
        }
    }, [playlistID])


    //shows&hides playlists tracks
    //TODO: try appending child on click
    function handlePlaylistTracksClick(elem) {
        let id = elem.target.id.slice(0, -10)
        let content = document.getElementById(`${id} tracks`)

        console.log('showing playlist: ',id)
        if (elem.target.innerHTML == "See Tracks"){
            setPlaylistID(id)    
            content.hidden = false
            elem.target.innerHTML = "Close Tracks"
        } else {    //close Playlist info 
            content.hidden = true //remove
            elem.target.innerHTML = "See Tracks"  
        }
    }


    return (
        <article>

            <section id="playlistsPageInfo" className="text-center">
                <h2>Playlists Page</h2>
                <h4 >Total Plalists: {totalPlaylists}</h4>
            </section>  <br/><hr/>

            <section id="topNavBtns" className="text-center navBtns">
                <span>     
                     {`${playlistOffset} - ${playlistOffset+50 < totalPlaylists? playlistOffset+50 : totalPlaylists}`} of {totalPlaylists}
                    <span>
                        <button onClick={()=> {
                            setPlayliistOffset( playlistOffset => playlistOffset == 0 ? 0 : playlistOffset - 50) 
                            }} className="btn btn-outline-primary">Prev</button>
                                            
                        <button onClick={()=> {
                            setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                            }} className="btn btn-outline-primary">Next</button>
                    </span>
                </span>  
            </section>  <br/><hr/>
            
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
                                {playlist.id == playlistInfo.id //&& document.getElementById("itemsBtn").innerHTML == 'Close' Broken 
                                ? <PlaylistItemsCard playlistData={playlistInfo}/> : null}
                            </div>
                        </li>
                    ) : "Error Getting Playlists"}
                </ul>   
            </section>  <br/><hr/>

            <section id="btmNavBtns" className="text-center navBtns">
                <span>     
                     {`${playlistOffset} - ${playlistOffset+50 < totalPlaylists? playlistOffset+50 : totalPlaylists}`} of {totalPlaylists}
                    <span>
                        <button onClick={()=> {
                            setPlayliistOffset( playlistOffset => playlistOffset == 0 ? 0 : playlistOffset - 50) 
                            }} className="btn btn-outline-primary">Prev</button>
                                            
                        <button onClick={()=> {
                            setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                            }} className="btn btn-outline-primary">Next</button>
                    </span>
                </span>  
            </section>

        </article>
    )

}