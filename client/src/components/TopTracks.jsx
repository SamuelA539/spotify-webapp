import { useState, useEffect } from "react"
import NavBtns from "./BaseElems/NavBtns"
import TrackCard from "./ElementCards/TrackCard"
import { DataError, FetchError} from "./Supporting/Errors";

//displays all top Tracks selection for time range
export default function TopTracks({navBtns = false}) {
    const [errFlg, setErrFlg] = useState({})

    const [topTracks, setTopTracks] = useState([])
    const [term, setTerm] = useState("short")
    const [pageSize, setPageSize] = useState(50)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] = useState(0)
    
    const nav = navBtns

//getting top tracks 
    useEffect(() => {
        //offset + limit < total
        fetch(`http://localhost:5000/topTracks?term=${term}&limit=${nav?pageSize:20}&offset=${nav?offset:0}`, {credentials: 'include'})
        .then(res => 
            res.json()
            .then(data => {
                    console.log('Top Track data: ', data)
                    if (data.status == 'success') {
                        setTopTracks(data.items)
                        setTotal(data.total)
                    } else throw Error('Bad resp data');
            })
            .catch(err => {
                console.warn('Data Error - getting top tracks: ', err)
                setErrFlg({
                    status: true,
                    errType: 'data', 
                    msg: 'Error Getting Top Tracks'
                })
            })
        )
        .catch(err => {
            console.warn('Fetch Error - getting top tracks: ', err)
            setErrFlg({
                status: true,
                errType: 'fetch', 
                msg: 'Error Getting Top Tracks'
            })
        })
    }, [term, pageSize, offset])

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
        <article>
            <section className="text-center">
                <h4>Top Tracks</h4>
                <h5>of the last {term == 'short' ? 'month' : term == 'medium' ? '6 months' : 'year' }</h5>  

                <div id="topTrackInfo" className="text-center">
                    <form onChange={btn => setTerm(btn.target.value)}>
                        Select Time Period: &#9;
                        <input type="radio" id="shortTerm" name="topTracksTerm" value="short" defaultChecked/>
                        <label htmlFor="shortTerm"> Short</label> &#9;

                        <input type="radio" id="medTerm" name="topTracksTerm" value="medium"/>
                        <label htmlFor="medTerm"> Medium</label> &#9;

                        <input type="radio" id="longTerm" name="topTracksTerm" value="long"/>
                        <label htmlFor="longTerm"> Long</label>
                    </form>
                        
                    {nav ? 
                        <label htmlFor="pageSizeSelect">Select Page Size &#9;
                        <select name="pageSizeSelect" id="pageSizeSelect" onChange={slctr => setPageSize(Number(slctr.target.value))}  value={pageSize}>
                            <option value="10">10 items per page</option>
                            <option value="25">25 items per page</option>
                            <option value="50">50 items per page</option>
                        </select></label> 
                    :null}
                </div>
            </section>

            
            {nav ? 
                <NavBtns 
                    pageSize={pageSize} 
                    offset={offset} 
                    total={total} 
                    fwrdFn={() => {
                        setOffset(o => o < total ? Number(o+pageSize) : Number(o))
                    }} 
                    bckwrdFn={() => {
                        setOffset(o => o-pageSize < 0 ? o : o-pageSize)
                    }}
                /> 
            :null}
            
            
            <ol id="topTracksList" start={offset+1}>
                {topTracks.length > 0 ? 
                    topTracks.map(t => 
                        <li key={t.id}>
                            <TrackCard track={t} height={125} width={125}/>
                        </li>
                    )
                :null}
            </ol>
    
            {nav ? 
                <NavBtns 
                    pageSize={pageSize} 
                    offset={offset} 
                    total={total} 
                    fwrdFn={() => {
                        setOffset(o => o < total ? Number(o+pageSize) : Number(o))
                    }} 
                    bckwrdFn={() => {
                        setOffset(o => o-pageSize < 0 ? o : o-pageSize)
                    }}
                /> 
            :null}   
        </article>
    )
}