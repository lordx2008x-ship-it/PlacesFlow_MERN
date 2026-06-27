import React ,{useEffect,useState, useContext}from "react";
import  {useParams,useHistory} from "react-router-dom";
import Input from "../../shared/component/FormElements/input";
import Button from "../../shared/component/FormElements/Button";
import Card from "../../shared/component/UIElements/Card";
import { VALIDATOR_REQUIRE,VALIDATOR_MINLENGTH } from "../../shared/util/validator";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import './PlaceForm.css';
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";




const UpdatePlace=()=>{
    const history=useHistory();
    const auth=useContext(AuthContext)
    const placeId=useParams().placeId;
    const {isLoading,error,sendRequest,clearError}=useHttpClient();
    const [loadedPlace,setLoadedPlace]=useState();
    const [formState,inputHandler,setFormData]=useForm({
        title:{
            value:'',
            isValid:false
        },
        description:{
            value:'',
            isValid:false
        }
    },false);
    useEffect(()=>{
        const fetchPlace=async()=>{
            try{
                const responseData=await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`);
                setLoadedPlace(responseData.requiredPlace);
                 
                    setFormData({title:{
                        value:responseData.requiredPlace.title,
                        isValid:true
                            },
                    description:{
                        value:responseData.requiredPlace.description,
                        isValid:true
                            }
                }
                ,true);
            }catch(err){

            }
        
        }
        fetchPlace();
    }
        ,[sendRequest,placeId,setFormData])

    const placeChangeSubmitHandler=async(event)=>{
        event.preventDefault();
        try{
            await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`,'PATCH',
                JSON.stringify({
                    title:formState.inputs.title.value,
                    description:formState.inputs.description.value,
                }),
                {'Content-Type':'application/json',
                 Authorization:'Bearer '+ auth.token   
                }
            );
            history.push('/'+auth.userId+'/places')
        }catch(err){

        }
    }        
        
    if(isLoading) {
        return(<div className="center">
                    <LoadingSpinner asOverlay/>
                </div>
            );
        }

    
    if(!loadedPlace && !error && isLoading) {
        return(<div className="center">
                   <Card> <h2>Couldn't find the place!!</h2></Card>
                </div>
            );
        }
    
    
    return (
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        {!isLoading && loadedPlace &&<form className="place-form" onSubmit={placeChangeSubmitHandler}>
            <Input 
                id='title'
                element='input'
                label='Title'
                type='text'
                validators={[VALIDATOR_REQUIRE()]}
                errorText='please enter a valid title'
                onInput={inputHandler}
                value={loadedPlace.title}
                isValid={true}/>
            <Input 
                id='description'
                element='textarea'
                label='Description'
                validators={[VALIDATOR_MINLENGTH(5)]}
                errorText='please enter a valid description'
                onInput={inputHandler}
                value={loadedPlace.description}
                isValid={true}/>    
            <Button type='submit' disabled={!formState.isValid}>UPDATE PLACE</Button>    
        </form>}
        </React.Fragment>
    );
};


export default UpdatePlace;