import React from 'react';
import {Route,Redirect} from 'react-router-dom';

export const ProtectedRoute = ({ component: Component, ...rest }) => {
    const token = localStorage.getItem('token');
    console.log(token)
    return (
        <Route
            {...rest}
            render={props => {
                if(token !== null) {
                    return <Component {...props} />;
                }
                else {
                    return <Redirect to={
                        {
                            pathname: '/login',
                            state: {
                                from: props.location
                            }
                        }
                    } />
                }
            }}
        />
    )
}