import React from "react";
import Card from"../../shared/component/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/component/FormElements/Button";
import "./PlaceList.css";

const PlaceList= props=>{
    if (props.items.length===0){
        return (
        <div className="place-list-center">
            <Card>
                <h2>No Places Found, Maybe Create One!!</h2>
            </Card>
            <Button to='/places/new'>Creat Place</Button>
        </div>
        );
    }
    return(
        <ul className="place-list">
            {props.items.map((place)=><PlaceItem 
            key={place._id} 
            id={place._id}
            image={`${process.env.REACT_APP_BACKEND_URL}/${place.image}`}
            title={place.title}
            description={place.description}
            address={place.address}
            creatorId={place.creator}
            coordinates={place.location}
            onDelete={props.onDeletePlace}
             />)}
        </ul>
    );
}

export default PlaceList;