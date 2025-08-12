import { useState, useEffect } from "react"
import TrackCard from "../components/TrackCard"
import NavBtns from "../components/NavBtns"

//displays all top Tracks selection for time range
export default function TopTracksPage() {
    const [topTracks, setTopTracks] = useState({})
    const [term, setTerm] = useState("short")
    const [pageSize, setPageSize] = useState(50)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] =  useState(0)

    const [errFlg, setErrFlg] = useState(false)

    useEffect(() => {
            //offset + limit < total
            fetch(`http://localhost:5000/topTracks?term=${term}&limit=${pageSize}&offset=${offset}`, 
            {
                credentials: 'include'
            })
            .then(res => 
                res.json()
                .then(data => {
                        console.log('Top Track data: ', data)
                        if (data.status == 'success') {
                            setTopTracks(data.items)
                            setTotal(data.total)
                        } else throw Error('Bad data error');
                })
                .catch(err => {
                    setErrFlg(true)
                    throw Error('Data Error: ', err)
                })
            )
            .catch(err => {
                setErrFlg(true)
                throw Error('Fetch Error: ', err)
            })
        }, [term, pageSize, offset])



    if (errFlg) throw Error('Top Tracks Page Error');
    return(
        <article>
            <section className="text-center">
                <h4>Top Tracks</h4>
                <h5>{term} term</h5>   <hr/>

                <div id="topTrackInfo" className="text-center">
                    <details> 
                        <summary>Term Descriptions</summary> 
                        <p>Short Term: 1 year of listening</p>
                        <p>Medium Term: 6 months of listening</p>
                        <p>Long Term: 1 month of listening</p>
                    </details>

                    <form onChange={btn => setTerm(btn.target.value)}>
                        Select Time Period: &#9;
                        <input type="radio" id="shortTerm" name="topTracksTerm" value="short" />
                        <label htmlFor="shortTerm"> Short</label> &#9;

                        <input type="radio" id="medTerm" name="topTracksTerm" value="medium"/>
                        <label htmlFor="medTerm"> Medium</label> &#9;

                        <input type="radio" id="longTerm" name="topTracksTerm" value="long"/>
                        <label htmlFor="longTerm"> Long</label>
                    </form>
                
                    <label htmlFor="pageSizeSelect">Select Page Size &#9;
                    <select name="pageSizeSelect" id="pageSizeSelect" onChange={slctr => setPageSize(Number(slctr.target.value))}  value={pageSize}>
                        <option value="10">10 items per page</option>
                        <option value="25">25 items per page</option>
                        <option value="50">50 items per page</option>
                    </select></label>
                </div>
            </section>  <hr/>

            <NavBtns 
                pageSize={pageSize} 
                offset={offset} 
                total={total} 
                fwrdFn={() => {
                    setOffset(o => o < total ? Number(o+pageSize) : Number(o))
                }} 
                bckwrdFn={() => {
                    setOffset(o => o == 0 ? 0 : o-pageSize)
                }}
            />

            <ol id="topTracksList" start={offset+1}>   
                {typeof topTracks != 'undefined' && topTracks.length > 0?
                    topTracks.map(t => <li key={t.id}><TrackCard track={t}/></li>)
                    :null
                }
            </ol>

            <NavBtns 
                pageSize={pageSize} 
                offset={offset} 
                total={total} 
                fwrdFn={() => {
                    setOffset(o => o < total ? Number(o+pageSize) : Number(o))
                    document.documentElement.scrollTop = 30
                }} 
                bckwrdFn={() => {
                    setOffset(o => o == 0 ? 0 : o-pageSize)
                    document.documentElement.scrollTop = 30
                }}
            />
        </article>
    )
}