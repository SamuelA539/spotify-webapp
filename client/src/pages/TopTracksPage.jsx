import { useState, useEffect } from "react"
import TrackCard from "../components/TrackCard"

//displays all top Tracks selection for time range
export default function TopTracksPage() {
    const [topTracks, setTopTracks] = useState({})
    const [term, setTerm] = useState("short")
    const [pageSize, setPageSize] = useState(50)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] =  useState(0)

    useEffect(() => {
            //offset + limit < total
            fetch(`http://localhost:5000/topTracks?term=${term}&limit=${pageSize}&offset=${offset}`)
            .then(res => 
                res.json()
                .then(data => {
                        console.log('Top Track data: ', data)
                        setTopTracks(data.items)
                        setTotal(data.total)
                })
                .catch(err => console.log('Data Error: ', err))
            )
            .catch(err => console.log('Fetch Error: ', err))
        }, [term, pageSize, offset])

    function handleTermChange(btn) {
        console.log("Selected: ", btn.target.value)
        setTerm(btn.target.value)
    }

    function handlePgSzChange(slctr) {
        console.log("Selected: ", slctr.target.value)
        setPageSize(Number(slctr.target.value))
    }

    return(
        <article>
            <section className="text-center">
                <h4>Top Tracks</h4>
                <h5>Term: {term}</h5>   <br/>
                <details> 
                    <summary>Term Descriptions</summary> 
                    <p>Short Term: 1 year of listening</p>
                    <p>Medium Term: 6 months of listening</p>
                    <p>Long Term: 1 month of listening</p>
                </details>  <hr/>

                <div className="text-center">
                    <p>Select Time Period: </p>
                    <form onChange={handleTermChange}>
                        <input type="radio" id="shortTerm" name="topTracksTerm" value="short" />
                        <label htmlFor="shortTerm"> Short</label>

                        <input type="radio" id="medTerm" name="topTracksTerm" value="medium"/>
                        <label htmlFor="medTerm"> Medium</label>

                        <input type="radio" id="longTerm" name="topTracksTerm" value="long"/>
                        <label htmlFor="longTerm"> Long</label>
                    </form> <br/>
                
                    <label htmlFor="pageSizeSelect">Select Page Size
                    <select name="pageSizeSelect" id="pageSizeSelect" onChange={handlePgSzChange}>
                        <option value="10">10 items per page</option>
                        <option value="25">25 items per page</option>
                        <option value="50">50 items per page</option>
                    </select></label>
                </div>
            </section>  

            <hr/>

            <section id="topNavBtns" className="text-center">
                <p>{offset+1} - {pageSize+offset} of {total}</p>
                <div>
                    <button onClick={() => {
                        setOffset(o => {
                            if(o-pageSize <= 0) {
                                return o
                            }else return o-pageSize;
                        })
                        document.documentElement.scrollTop = 0
                    }} className="btn btn-primary">prev</button>
                
                    <button onClick={() => {
                        setOffset(o => {
                            if(o+pageSize >= total) {
                                return o
                            }else return 0+pageSize;
                        })
                        document.documentElement.scrollTop = 0
                    }} className="btn btn-primary">next</button>
                </div>
            </section>

            <ol id="topTracksList" start={offset+1}>   
                {typeof topTracks != 'undefined' && topTracks.length > 0?
                    topTracks.map(t => <li key={t.id}><TrackCard track={t}/></li>)
                    :null
                }
            </ol>

            <section id="btmNavBtns" className="text-center">
                <p>{offset+1} - {pageSize+offset} of {total}</p>
                <div>
                    <button onClick={() => {
                        setOffset(o => {
                            if(o-pageSize <= 0) {
                                return o
                            }else return o-pageSize;
                        })
                        document.documentElement.scrollTop = 0
                    }} className="btn btn-primary">prev</button>
                
                    <button onClick={() => {
                        setOffset(o => {
                            if(o+pageSize >= total) {
                                return o
                            }else return 0+pageSize;
                        })
                        document.documentElement.scrollTop = 0
                    }} className="btn btn-primary">next</button>
                </div>
            </section>
        </article>
    )
}