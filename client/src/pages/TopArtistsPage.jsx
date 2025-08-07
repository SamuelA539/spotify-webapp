import { useState, useEffect } from "react"
import ArtistCard from "../components/ArtistCard"
import NavBtns from "../components/NavBtns"

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
                    if (data.status == "success") {
                        setTopArtists(data.items)
                        setTotal(data.total)
                    } else throw Error('Bad Server Data')
            })
            .catch(err => console.log('Data Error: ', err))
        )
        .catch(err => console.log('Fetch Error: ', err))
    }, [term, pageSize, offset])
    
    function handleTermChange(btn) {
        setTerm(btn.target.value)
    }

    function handlePgSzChange(slctr) {
        setPageSize(Number(slctr.target.value))
    }

    return (
        <article>
            <section className="text-center">
                <h4>Top Artists</h4>
                <h5>{term} term</h5>    <hr/>

                <div id="topArtistInfo" className="text-center">
                    <details> 
                        <summary>Term Descriptions</summary> 
                        <p>Short Term: 1 year of listening</p>
                        <p>Medium Term: 6 months of listening</p>
                        <p>Long Term: 1 month of listening</p>
                    </details>

                    <form onChange={handleTermChange} value={term}>
                        Select Time Period: &#9;
                        <input type="radio" id="shortArtist" name="topArtistsTerm" value="short" />
                        <label htmlFor="shortArtist">Short</label> &#9;

                        <input type="radio" id="medArtist" name="topArtistsTerm" value="medium"/>
                        <label htmlFor="medArtist">Medium</label> &#9;

                        <input type="radio" id="longArtist" name="topArtistsTerm" value="long"/>
                        <label htmlFor="longArtist">Long</label>
                    </form> 

                    <label htmlFor="pageSizeSelect">Select Page Size</label> &#9;
                    <select name="pageSizeSelect" id="pageSizeSelect" onChange={handlePgSzChange} value={pageSize}>
                            <option value="10">10 items per page</option>
                            <option value="25">25 items per page</option>
                            <option value="50">50 items per page</option>
                    </select>
                </div>
            </section> <hr/>

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

            <ol id="topArtistsList" start={offset+1}>
                {typeof topArtists != 'undefined' && topArtists.length > 0?
                    topArtists.map(art => <li key={art.id} ><ArtistCard artist={art}/></li>)
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