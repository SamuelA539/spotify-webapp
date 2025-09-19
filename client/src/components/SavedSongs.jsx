import { useEffect, useState } from "react"

import TrackCard from "./ElementCards/TrackCard"
import NavBtns from './BaseElems/NavBtns'
import { DataError, FetchError} from "./Supporting/Errors";

//displays saved songs
export default function SavedSongs() {
    const [errFlg, setErrFlg] = useState({})
    
    const [songs, setSongs] = useState({})
    const [total, setTotal] = useState(0)
    const [offset, setOffset] = useState(0)


//fetching saved songs
    useEffect(()=> {
        fetch(`http://localhost:5000/savedSongs?offset=${offset}`, {credentials: 'include'})
        .then( res => res.json()
            .then( data => {
                console.log('Saved songs page: ', data)
                if (data.status == "success") {
                    setSongs(data.tracks)
                    setTotal(data.total)
                } else throw Error('Bad Data Error');
            })
            .catch(err => {
                console.warn('Data Error - getting Saved Songs: ', err)
                setErrFlg({
                    status: true,
                    errType: 'data', 
                    msg: 'Error Getting Saved Songs'
                })
            })
        )
        .catch(err => {
            console.warn('Fetch Error - getting Saved Songs: ', err)
            setErrFlg({
                status: true,
                errType: 'fetch', 
                msg: 'Error Getting Saved Songs'
            })
        })
    }, [offset])

//Downloads text file of savedsongs
    //TODO error handle
    function handleToTextClick(elem){
        alert("please be patient playlists over 1000 have long load times")

        fetch(`http://localhost:5000/savedSongs/toText/`, 
            {
                credentials: 'include'
            })
        .then(res => res.blob()
            .then( blob => {
                console.log(blob)
                if (blob){
                    let url = URL.createObjectURL(blob); //console.log(url)
                    var anch = document.createElement('a')
                    anch.href = url
                    anch.download = 'savedSongs'
                    anch.click()
                    URL.revokeObjectURL(url)
                    anch.remove()
                } else {
                    throw Error('Bad Data Error')
                }   
            })
        ).catch(err => { //TODO handle
            console.warn('handleTestClick Error: ', err) 
        })
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
            <section className="text-center">
                <h2>Saved Songs</h2>
                <h3>Total Saved Songs: {total}</h3>  
                <button onClick={handleToTextClick}>ToText</button>   
            </section> 
            
            <br/><hr/>
            
            <NavBtns
                pageSize = {50}
                offset = {offset}
                total = {total}
                fwrdFn = {()=> {
                    setOffset(o => o+50 > total ? o : o+50)
                }}
                bckwrdFn = {()=> {
                    setOffset(o => o-50 < 0 ? o : o-50)
                }}
            />
            
            <hr/>

            <ul className="list-group">
                {typeof songs != 'undefined'? 
                    songs.length > 0? 
                        songs.map(t => 
                            <li key={t.id} className="list-group-item"> 
                                <TrackCard track={t} height={125} width={125}/> 
                                {/* <p>Date Added: {Date(t.added_date)}</p> */}
                            </li>
                        ) 
                        :'No Saved Songs' 
                :null}
            </ul>

            <NavBtns
                pageSize = {50}
                offset = {offset}
                total = {total}
                fwrdFn = {()=> {
                    setOffset(o => o+50 > total ? o : o+50)
                    document.documentElement.scrollTop = 0
                }}
                bckwrdFn = {()=> {
                    setOffset(o => o-50 < 0 ? o : o-50)
                    document.documentElement.scrollTop = 0
                }}
            />
        </article>
    )

}