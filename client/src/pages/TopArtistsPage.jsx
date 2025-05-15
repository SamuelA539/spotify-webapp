import { useState, useEffect } from "react"
import ArtistCard from "../components/ArtistCard"

//displays all top artists selection for time range
export default function TopArtistsPage() {
    const [topArtists, setTopArtists] = useState({})
    const [term, setTerm] = useState("short")
    const [pageSize, setPageSize] = useState(50)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        //offset + limit < total
        fetch(`http://localhost:5000/topArtists?term=${term}&limit=${pageSize}&offset=${offset}`)
        .then(res => 
            res.json()
            .then(data => {
                    console.log('Top Artist data: ', data)
                    setTopArtists(data.items)
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

    return (
        <>
            <div className="text-center">
                <h4>Top Artists</h4> <hr/>
                <h5>Term: {term}</h5><br/>
                <p>
                    Term Description<br/>
                    Short Term: 1 year of listening<br/>
                    Medium Term: 6 months of listening<br/>
                    Long Term: 1 month of listening<br/>
                </p> 
            </div>

            <div className="text-center">
                <p>Select Time Period</p>
                <form onChange={handleTermChange}>
                    <input type="radio" id="shortArtist" name="topArtistsTerm" value="short" />
                    <label htmlFor="shortArtist">Short</label>

                    <input type="radio" id="medArtist" name="topArtistsTerm" value="medium"/>
                    <label htmlFor="medArtist">Medium</label>

                    <input type="radio" id="longArtist" name="topArtistsTerm" value="long"/>
                    <label htmlFor="longArtist">Long</label>
                </form> 
            </div> <hr/>
            
            <div className="text-center">
                <label htmlFor="pageSizeSelect">Select Page Size</label>
                <select name="pageSizeSelect" id="pageSizeSelect" onChange={handlePgSzChange}>
                        <option value="10">10 items per page</option>
                        <option value="25">25 items per page</option>
                        <option value="50">50 items per page</option>
                </select>
            </div><hr/>

            <div className="text-center">
                <p>{offset+1} - {pageSize+ offset} of {total}</p>
                <div className="btn-group">
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
                    }}className="btn btn-primary">next</button>
                </div>
            </div>

            <ol id="topArtistsList" start={offset+1} >           

                {typeof topArtists != 'undefined' && topArtists.length > 0?
                    topArtists.map(art => <li key={art.id} ><ArtistCard artist={art}/></li>)
                    :null
                }
            </ol>

            <div className="text-center">
                <p>{offset+1} - {pageSize+ offset} of {total}</p>
                <div className="btn-group">
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
                    }}className="btn btn-primary">next</button>
                </div>
            </div>
        </>
    )
}