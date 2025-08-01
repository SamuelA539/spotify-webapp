import "../styles/NavBtns.css"

export default function NavBtns({pageSize, offset, total, fwrdFn, bckwrdFn}){

    return (
        <section className="text-center navBtns">
                <span>     
                    {`${offset+1} - ${offset+pageSize > total ? total: pageSize+offset} of ${total}`}
                    <span>
                        <button onClick={bckwrdFn} className="btn btn-outline-primary">Prev</button>
                        <button onClick={fwrdFn} className="btn btn-outline-primary">Next</button>
                    </span>
                </span>  
        </section>
        
    )
}