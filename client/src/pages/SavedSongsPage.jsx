import { useEffect, useState } from "react"
import TrackCard from "../components/TrackCard"
import NavBtns from '../components/NavBtns'

import LoadingPage from "./LoadingPage"


//displays saved songs
export default function SavedSongsPage() {
    const [songs, setSongs] = useState({})
    const [total, setTotal] = useState(0)
    const [offset, setOffset] = useState(0)

    const [errFlg, setErrFlg] = useState(false)

    useEffect(()=> {
        fetch(`http://localhost:5000/savedSongs?offset=${offset}`)
        .then( res => res.json()
            .then( data => {
                console.log(data)
                if (data.status == "success") {
                    setSongs(data.items)
                    setTotal(data.total)
                } else throw Error('Bad Data Error');
            })
            .catch(err => {
                setErrFlg(true)
                console.error('Data Error: ', err)
            })
        )
        .catch(err => {
            setErrFlg(true)
            console.error('Fetch Error: ', err)
        })

    }, [offset])

    function handleToTextClick(elem){
        alert("please be patient playlists over 1000 have long load times")
        console.log(elem.target)
        // let id = elem.target.id.slice(0, -7)
        console.log('id: ', id)

        fetch(`http://localhost:5000/savedSongs/toText/`)
        .then(res => res.blob().then( blob => {
                console.log(blob)
                if (blob){
                    let url = URL.createObjectURL(blob);    console.log(url)
                    var anch = document.createElement('a')
                    anch.href = url
                    anch.download = 'savedSongs'
                    anch.click()

                    URL.revokeObjectURL(url)
                    anch.remove()
                }
            })
        ).catch(err => console.log('handleTestClick Error: ', err))
    }


    if (errFlg) {
        return (
             <>
                <div>
                    Saved Songs page test
                </div> <br/><br/>
                <LoadingPage/>
            </>
        )
    }

    return (
        <article>  
            
            <section className="text-center">
                <h2>Saved Songs</h2>
                <button onClick={handleToTextClick}>ToText</button>
                {/* <h3>Total Saved Songs: {total}</h3>  */}
            </section> 
            
            <br/><hr/>
            
            <NavBtns
                pageSize = {50}
                offset = {offset}
                total = {total}
                fwrdFn = {()=> {
                    setOffset(o => o+50 > total ? o : o+50)
                    // document.documentElement.scrollTop = 0
                }}
                bckwrdFn = {()=> {
                    setOffset(o => o-50 < 0 ? o : o-50)
                    // document.documentElement.scrollTop = 0
                }}
            />
            
            <hr/>

            <ul className="list-group">
                {typeof songs != 'undefined'? 
                    songs.length > 0? songs.map(t => 
                        <li key={t.track.id} className="list-group-item"> 
                            <TrackCard track={t.track}/> 
                            {/* Print Date Different */}
                            <p>Date Added: {Date(t.added_at)}</p>
                        </li>
                    )
                    :'No Saved Songs' 
                :null
                }
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

}8