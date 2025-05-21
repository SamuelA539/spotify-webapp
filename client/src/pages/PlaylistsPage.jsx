import { useEffect, useState } from "react";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistItemsCard from "../components/PlaylistItemsCard";
import LoadingPage from "./LoadingPage";



//useTranstion on list
//fix next and Prev btns 

export default function PlaylistsPage() {
    const [totalPlaylists, setTotalPlaylists] = useState(0) //dosent need to be state(just param in json)
   
    const [playlistOffset, setPlayliistOffset] = useState(0)
    const [playlists, setPlaylists] = useState([])

    const [playlistInfo, setPlaylistInfo] = useState([])
    const [playlistID, setPlaylistID] = useState([])

    const [errFlg, setErrFlg] = useState(false)

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

    //need error check?
    useEffect( () => {
        if (playlistID != "") { 
            fetch(`http://localhost:5000/playlist/${playlistID}`)
            .then(res => {
                res.json()
                .then(data => {
                    if (data !== null) { //alt not empty check
                        console.log('playlist ',data)
                        setPlaylistInfo(data)
                    }else if (typeof data.detail !== "undefined" && data.detail.length > 0){
                        console.log(data.detail[0].msg)
                        throw new Error(`data error: ${typeof data.detail[0].msg !== 'undefined' ? data.detail[0].msg : 'Unkown'}`);
                        //throw new Error('NOnononono')
                    }else {
                        throw new Error('Gotta Problem Doc')
                    }
                })
            }).catch(err => {
                console.log("Something Went Wrong")
                console.error(err)
            })
        }
    }, [playlistID])


    if (errFlg) {
        return (
            <>
                <div>
                    Playlists page test
                </div> <br/><br/>
                <LoadingPage/>
            </>
        )
    }

    return (
        <>
            <div id="playlistsInfo" className="text-center">
                <h2>Playlists Page</h2>
                <h4 >Total Plalists: {totalPlaylists}</h4>
            </div> <br/><hr/>

            <div id="topNavBtns">
                <p className="text-center">{`${playlistOffset} - ${playlistOffset+50 < totalPlaylists? playlistOffset+50 : totalPlaylists}`} of {totalPlaylists}</p><br/>
                <div className="btn-group">     
                    {/* <button onClick={()=>{
                        playlistOffset != 0 ? setPlayliistOffset((playlistOffset)=> {playlistOffset-50}): null}}>Prev</button> */}
                    <button onClick={()=> {
                        setPlayliistOffset( playlistOffset => playlistOffset == 0 ? 0 : playlistOffset - 50) 
                        }} className="btn btn-outline-primary">Prev</button>
                    
                    <button onClick={()=> {
                        setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                        }} className="btn btn-outline-primary">Next</button>
                </div>  
            </div><br/><hr/>

            <ul className="list-group">
                {playlists.length > 0 ? playlists.map( (playlist)=>
                    <li key={playlist.id} className="list-group-item">                         
                        
                        <PlaylistCard playlist={playlist}/>
                        <hr/>

                        <button id={`${playlist.id} btn`} onClick={() => { 
                            var btn = document.getElementById(`${playlist.id} btn`)
                            if (btn.innerHTML == "See Tracks"){
                                setPlaylistID(playlist.id) 
                                document.getElementById(`${playlist.id} content`).hidden = false
                                btn.innerHTML = "Close Tracks"
                            } else {
                                document.getElementById(`${playlist.id} content`).hidden = true
                                btn.innerHTML = "See Tracks"
                                //close PLaylst info 
                            }
                        }} className="btn btn-primary">See Tracks</button>
                        
                        <div id={`${playlist.id} content`} >
                            {playlist.id == playlistInfo.id //&& document.getElementById("itemsBtn").innerHTML == 'Close' Broken 
                            ? <PlaylistItemsCard playlistData={playlistInfo} playlistTracks={playlistInfo.tracks}/> : null}
                        </div>
                    </li>
                ) : "Error Getting Playlists"}
            </ul>   <br/><hr/>

            {/* Nav buttons ?FIX? */}
            <div id="btmNavBtns">
            <p className="text-center">{`${playlistOffset} - ${playlistOffset+50 < totalPlaylists? playlistOffset+50 : totalPlaylists}`} of {totalPlaylists}</p><br/>
            <div className="btn-group">     
                {/* <button onClick={()=>{
                    playlistOffset != 0 ? setPlayliistOffset((playlistOffset)=> {playlistOffset-50}): null}}>Prev</button> */}
                <button onClick={()=> {
                    setPlayliistOffset( playlistOffset => playlistOffset == 0 ? 0 : playlistOffset - 50) 
                    }} className="btn btn-outline-primary">Prev</button>
                
                <button onClick={()=> {
                    setPlayliistOffset( playlistOffset => playlistOffset + 50 > totalPlaylists ? playlistOffset : playlistOffset + 50 ) 
                    }} className="btn btn-outline-primary">Next</button>
            </div> 
            </div> 
        </>
    )

}