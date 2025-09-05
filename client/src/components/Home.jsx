import UserProfileCard from "./ElementCards/UserProfileCard";

import { PageErrorBoundry } from "./Supporting/PageErrorBoundry";


//Error Handling
export default function HomeElement() {

    return (
        <article> 
            <section className="text-center">
                <h2 id='HomeTitle'>Welcome To Sam's Spotify Page</h2> <br/>
                <PageErrorBoundry>
                    <UserProfileCard height={150} width={150}/>
                </PageErrorBoundry>
            </section>
            
            <br/>

            <section id="appDescrip" className="text-center">
                    <h3 id='todoListTitle' className="text-center">Things to Do</h3>
                    <ul id="todoList" className="list-gorup">
                        <li className="list-group-item">Home: Look at your user name</li>
                        <li className="list-group-item">Playlists: see your playlists maybe stuff happens</li>
                        <li className="list-group-item">User: tbh not done yet I cant wait to see either</li>
                    </ul>
                    <p id="appLabel" className="text-center fs-6 font-monospace fw-semibold">This is a cool app please use properly</p>
            </section> 
        </article>
    )
}