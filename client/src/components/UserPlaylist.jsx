import { useEffect, useState} from "react";
import PlaylistCard from "./ElementCards/PlaylistCard";
import PlaylistItemsCard from "./ElementCards/PlaylistItemsCard";
import NavBtns from "./BaseElems/NavBtns";
import { DataError, FetchError} from "./Supporting/Errors";
import { PageErrorBoundry } from "./Supporting/PageErrorBoundry";

//displays users playlists
export default function UserPlaylists() {
    const [errFlg, setErrFlg] = useState({})
    
    const [totalPlaylists, setTotalPlaylists] = useState(0) //dosent need to be state(just param in json)
    const [playlistOffset, setPlayliistOffset] = useState(0)
    const [playlists, setPlaylists] = useState([])
    const [playlistID, setPlaylistID] = useState('')


//gets user's playlists
    //check then catches
    useEffect( ()=> {
        fetch(`http://localhost:5000/playlists?offset=${playlistOffset}`, 
            {
                credentials: 'include'
            })
        .then(res => {
            res.json()
            .then(data => {
                console.log('playlist page-playlist: ', data)
                if (data.status == "success") { 
                    setTotalPlaylists(data.total)
                    setPlaylists(data.items)
                }else throw Error('Bad resp data');
            })
            .catch( err => {
                console.warn('Data Error - getting playlists: ', err)
                setErrFlg({
                    status: true,
                    errType: 'data', 
                    msg: 'Error Getting User Playlists'
                })
            });
        })  
        .catch(err => {//fetch Error
            console.warn('Fetch Error - getting playlists: ', err)
            setErrFlg({
                status: true,
                errType: 'fetch', 
                msg: 'Error Getting User Playlists'
            })
        })
    },[playlistOffset]);

//shows & hides playlists tracks
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
                    setPlayliistOffset(o => 
                        o + 50 > totalPlaylists ? o : playlistOffset + 50
                    ) }}
                bckwrdFn={()=> {
                    setPlayliistOffset(o => 
                        o-50 < 0 ? o : o-50
                    ) }}
            />
            
            <section id="playlistsList">
                <ul className="list-group">
                    {playlists.length > 0 ? playlists.map( (playlist) =>
                        <li key={playlist.id} className="list-group-item">                         
                            
                            <PlaylistCard playlist={playlist}/> <hr/>
                            
                            <button 
                                id={`${playlist.id}-tracksBtn`} 
                                onClick={handlePlaylistTracksClick} 
                                className="btn btn-primary">See Tracks</button>

                            <PageErrorBoundry>
                                <div id={`${playlist.id} tracks`}>
                                    {playlist.id == playlistID 
                                    ? <PlaylistItemsCard id={playlistID}/> : null}
                                </div>
                            </PageErrorBoundry>
                        </li>
                    ) : "Error Getting Playlists"}
                </ul>   
            </section> 
            
             <NavBtns id="btmNavBtns"
                pageSize={50}
                offset={playlistOffset}
                total={totalPlaylists}
                fwrdFn={() => {
                    setPlayliistOffset( o => 
                        o + 50 > totalPlaylists ? o : o + 50 
                    ) }}
                bckwrdFn={() => {
                    setPlayliistOffset(o => 
                        o-50 < 0 ? o : o-50
                    ) }}
            />

        </article>
    )

}