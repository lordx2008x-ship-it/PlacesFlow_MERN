import React ,{useState,useEffect} from "react";
import { useParams } from "react-router-dom";
import PlaceList from "../components/PlaceList";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";


const UserPlaces= ()=>{
    const [loadedPlaces,setLoadedPlaces]=useState();
    const {isLoading,error,sendRequest,clearError}=useHttpClient();
    const uid=useParams().uid;
    useEffect(()=>{
        const fetchPlaces=async()=>{
            try{
                const responseData=await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/users/${uid}`);
                setLoadedPlaces(responseData)
            }catch(err){

            }
        }
        fetchPlaces();
    }
        ,[sendRequest,uid])
    const placeDeleteHandler=(deletedPlaceId)=>{
        setLoadedPlaces(prevPlaces=>prevPlaces.filter(p=>p._id!==deletedPlaceId))
    };    

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            {isLoading && <LoadingSpinner asOverlay />}
            {!isLoading&&loadedPlaces&&<PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler}/>}
        </React.Fragment>
        )        
}       

export default UserPlaces;