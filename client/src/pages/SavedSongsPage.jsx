import { useEffect, useState } from "react"
import TrackCard from "../components/TrackCard"
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
                setSongs(data.items)
                setTotal(data.total)
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
        <>  
            <div className="text-center">
                <h2>Saved Songs</h2>
                <h3>Total Saved Songs: {total}</h3> 
            </div> <br/><hr/>

            <div id="btmNavBtns" className="text-center">
                <p>{offset} - {offset + 50} of {total}</p>

                <button id="prevBtn" onClick={()=> {
                    setOffset(o => {
                        if (o-50 < 0) return o;
                        else {
                            return o-50;
                        }
                    })
                    document.documentElement.scrollTop = 0
                }} className="btn btn-secondary">  Prev   </button>
                
                <button id="nextBtn" onClick={() => {
                    setOffset(o => {
                        if (o + 50 > total) return 0;
                        else {
                            return o + 50;
                        }
                    })
                    document.documentElement.scrollTop = 0
                }} className="btn btn-secondary">  Next  </button>
            </div> <hr/>

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

            <div id="btmNavBtns" className="text-center">
                <p>{offset} - {offset + 50} of {total}</p>

                <button id="prevBtn" onClick={()=> {
                    setOffset(o => {
                        if (o-50 < 0) return o;
                        else {
                            return o-50;
                        }
                    })
                    document.documentElement.scrollTop = 0
                }} className="btn btn-secondary">  Prev   </button>
                
                <button id="nextBtn" onClick={() => {
                    setOffset(o => {
                        if (o + 50 > total) return 0;
                        else {
                            return o + 50;
                        }
                    })
                    document.documentElement.scrollTop = 0
                }} className="btn btn-secondary">  Next  </button>
            </div>  

        </>
    )

}