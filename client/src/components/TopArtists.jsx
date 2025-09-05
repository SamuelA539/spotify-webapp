import { useState, useEffect } from "react"
import NavBtns from "./BaseElems/NavBtns"
import ArtistCard from "./ElementCards/ArtistCard"
import { DataError, FetchError} from "./Supporting/Errors";

//displays all top artists selection for time range
export default function TopArtists({navBtns = false}) {
    const [errFlg, setErrFlg] = useState(false)    

    const [topArtists, setTopArtists] = useState([])
    const [term, setTerm] = useState("short")
    const [pageSize, setPageSize] = useState(50)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] = useState(0)

    const nav = navBtns
    
    useEffect(() => {
        //offset + limit < total
        fetch(`http://localhost:5000/topArtists?term=${term}&limit=${nav?pageSize:20}&offset=${nav?offset:0}`, {credentials: 'include'})
        .then(res => 
            res.json()
            .then(data => {
                if (data.status == "success") {
                    setTopArtists(data.items)
                    setTotal(data.total)
                } else throw Error('Bad Server Data');
            })
            .catch(err => {
                console.warn('Data Error - getting top artists: ', err)
                setErrFlg({
                    status: true,
                    errType: 'data', 
                    msg: 'Error Getting Top Artists'
                })
            })
        )
        .catch(err => {
            console.warn('Fetch Error - getting top artists: ', err)
            setErrFlg({
                status: true,
                errType: 'fetch', 
                msg: 'Error Getting Top Artists'
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
    
    return (
        <article>
            <section className="text-center">
                <h4>Top Artists</h4>
                <h5>of the last {term == 'short' ? 'month' : term == 'medium' ? '6 months' : 'year' }</h5>

                <div id="topArtistInfo" className="text-center">
                    <form onChange={btn => {
                            setTerm(btn.target.value); 
                            setOffset(0);
                        }} value={term}>
                        Select Time Period: &#9;
                        <input type="radio" id="shortArtist" name="topArtistsTerm" value="short" defaultChecked/>
                        <label htmlFor="shortArtist">Short</label> &#9;

                        <input type="radio" id="medArtist" name="topArtistsTerm" value="medium"/>
                        <label htmlFor="medArtist">Medium</label> &#9;

                        <input type="radio" id="longArtist" name="topArtistsTerm" value="long"/>
                        <label htmlFor="longArtist">Long</label>
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
                        setOffset(o => o == 0 ? 0 : o-pageSize)
                    }}
                /> 
            :null}

            <ol id="topArtistsList" start={offset+1}>  
                {topArtists.length > 0?
                    topArtists.map(art => 
                    <li key={art.id}>
                        {/* <ItemCard itemElem={<ArtistElement artist={art} width={150} height={150}/>}/> */}
                        <ArtistCard artist={art}/>
                    </li>)
                : null}
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
                        setOffset(o => o == 0 ? 0 : o-pageSize)
                    }}
                /> 
            :null}
        </article>
    )
}