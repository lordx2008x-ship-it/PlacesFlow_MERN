import React , {useState,useContext} from "react";
import Card from"../../shared/component/UIElements/Card";
import Button from "../../shared/component/FormElements/Button";
import Modal from "../../shared/component/UIElements/modal.js";
import MyMap from "../../shared/component/UIElements/myMap.js";
import { AuthContext } from "../../shared/context/auth-context.js";
import {useHttpClient} from "../../shared/hooks/http-hook.js";
import "./PlaceItem.css"
import ErrorModal from "../../shared/component/UIElements/ErrorModal.js";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner.js";

const PlaceItem= props=>{
    const [showMap,setShowMap]=useState(false);
    const [showConfirmModal,setShowConfirmModal]=useState(false);
    const {isLoading,error,sendRequest,clearError}=useHttpClient();
    const openMapHandler= ()=>setShowMap(true);
    const closeMapHandler = ()=>setShowMap(false);
    const showDeleteWarningHandler=()=>{setShowConfirmModal(true)};
    const cancelDeleteHandler= ()=>{setShowConfirmModal(false)};
    const auth=useContext(AuthContext);
    
    const confirmDeleteHandler= async()=>{
        try{
            await sendRequest(process.env.REACT_APP_BACKEND_URL+`/api/places/${props.id}`,'DELETE',null,{Authorization:'Bearer '+ auth.token });
            props.onDelete(props.id);
        }catch(err){

        }
        setShowConfirmModal(false);
    };
    

    return(
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            <Modal 
            show={showMap}
            onCancel={closeMapHandler} 
            header={props.address} 
            contentClass='place-item__modal-content' 
            footerClass='place-item__modal-action'
            footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
                <div className="map-container">
                         <MyMap coordinates={props.coordinates}/>
                </div>
            </Modal>
            <Modal  header='are you sure?' 
                    footerClass='place-item__modal-actions'
                    footer={
                            <React.Fragment>
                                <Button inverse onClick={cancelDeleteHandler}>CANCEL</Button>
                                <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
                            </React.Fragment>
                            }
                    show={showConfirmModal}
                    onCancel={cancelDeleteHandler}
                    >
                <p>are you sure you want to delete this place? please note that it can't be undone!!</p>
            </Modal>
            <li className="place-item">
                <Card className="place-item__content">
                {isLoading&&<LoadingSpinner asOverlay/>}
                <div className="place-item__image">
                    <img src={props.image} alt={props.title}/>
                </div>
                <div className="place-item__info">
                    <h2>{props.title}</h2>
                    <h3>{props.address}</h3>
                    <p>{props.description}</p>
                </div>
                <div className="place-item__actions">
                    <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>
                    {auth.userId===props.creatorId._id &&
                        (<Button to={`/places/${props.id}`}>EDIT</Button>
                        )}
                    {auth.userId===props.creatorId._id  &&(
                        <Button danger onClick={showDeleteWarningHandler}>DELETE</Button>
                        )}
                </div>
                </Card>
            </li>
        </React.Fragment>
    );
}

export default PlaceItem;