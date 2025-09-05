import { Outlet } from "react-router";
import { PageErrorBoundry } from "../components/Supporting/PageErrorBoundry";

//base layout for USer pages
export default function UserLayout() {
  const logged = useContext(LoggedContext);
  const [logState, setLogState] = useState(false);

//backend logged check
  useEffect(() => {
  fetch("http://localhost:5000/user")
    .then(res => res.json().then(data => {
      if (data.status === 'success') {
        console.log(data)
        setLogState(true)
      }
    }))
    .catch(err => console.error("Root Login error: ", err))
    }, 
  [])
  
  return (
    <article>
      <PageErrorBoundry>
        {logged ? <Outlet/> : <LoadingPage/>}
      </PageErrorBoundry>  
    </article>
  )
}