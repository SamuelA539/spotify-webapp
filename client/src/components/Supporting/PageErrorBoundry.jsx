import { Component } from "react";
import { DataError, FetchError } from "./Supporting/Errors";

export class PageErrorBoundry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false, 
            message: null
        }
    }
    
    static getDerivedStateFromError(error) {
        //error props
            //name
            //stack
            //message
        return {
            hasError: true,
            type: error instanceof DataError ? 'data' 
                : error instanceof FetchError ? 'fetch': 'unknown', 
            message: error.message}
    } 

    componentDidCatch(error, info){
        // console.error('Error Boundry caught: ', error)
        // console.log('Error Info: ', info.componentStack)
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center">
                    <h3>{this.state.message}</h3>
                    
                    {this.state.type == 'data' ? 
                        <>
                            <h5>data error</h5>
                            <h6>Please try refreshing page</h6>
                        </>
                        :this.state.type == 'fetch' ? 
                            <>
                                <h5>fetch error</h5>
                                <h6>Please try logging out and logging back in</h6>
                            </> 
                            :<p>Unknown Error</p>
                    }
                </div>
            )
        }
        return this.props.children
    }
}