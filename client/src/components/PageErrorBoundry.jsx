import { Component } from "react";

export class PageErrorBoundry extends Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false}
    }
    

    static getDerivedStateFromError(error) {
        return {hasError: true}
    } 

    componentDidCatch(error, info){
        console.log('Error Boundry caught: ', error)
        console.log('Error Info: ', info.componentStack)

    }
    
    render() {
        if (this.state.hasError) {
            return (
                <>
                    Error
                </>
            )
        }
        return this.props.children
    }
}