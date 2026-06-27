import React  from "react";
import Input from'../../shared/component/FormElements/input';
import Button from '../../shared/component/FormElements/Button';
import { VALIDATOR_REQUIRE,VALIDATOR_MINLENGTH } from "../../shared/util/validator";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from '../../shared/component/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/component/UIElements/LoadingSpinner';
import { useHistory } from "react-router-dom";
import './PlaceForm.css';
import ImageUpload from './../../shared/component/FormElements/ImageUpload';




const NewPlace = () => {
    const auth=useContext(AuthContext);
    const {isLoading,error,sendRequest,clearError}=useHttpClient();
    const [formState,inputHandler]=useForm({
        title:{
            value:'',
            isVAlid:false
        },
        description:{
            value:'',
            isValid:false
        },
        address:{
            value:'',
            isValid:false
        },
        image:{
            value:null,
            isValid:false
        }
    },false)
    const history=useHistory();
    const formSubmitHandler= async event=>{
        event.preventDefault();
        const formData=new FormData();
        formData.append('title',formState.inputs.title.value);
        formData.append('description',formState.inputs.description.value);
        formData.append('address',formState.inputs.address.value);
        formData.append('image',formState.inputs.image.value);


        try{
            await sendRequest(process.env.REACT_APP_BACKEND_URL+'/api/places','POST',formData,{Authorization:'Bearer '+auth.token})
            history.push('/')
        }catch(err){

        }
    };
    return (
    <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        <form className="place-form" onSubmit={formSubmitHandler}>
            {isLoading && <LoadingSpinner asOverlay/>}
            <Input 
            id='title'
            type='text'
            label='title'
            element='input'
            errorText='please enter a valid title!'
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}/>
            
            <Input 
            id='description'
            label='Description'
            element='textarea'
            errorText='please enter a valid description (at least 5 characters!'
            validators={[VALIDATOR_MINLENGTH(5)]}
            onInput={inputHandler}/>
            <Input 
            id='address'
            type='text'
            label='Address'
            element='input'
            errorText='please enter a valid address!'
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}/>   
            <ImageUpload id='image' onInput={inputHandler} errorText='please provide an image'/>
            <Button type='submit' disabled={!formState.isValid}>ADD A PLACE</Button>
        </form>
    </React.Fragment>
    );
}

export default NewPlace;