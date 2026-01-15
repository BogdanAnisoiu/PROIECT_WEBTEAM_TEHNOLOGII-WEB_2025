import React from "react";
import './Cursuri.css';

const Notita = ({ data }) => {
    // const navigate = useNavigate(); //nu este necesar pentru tab nou

    const handleClick = () => {
        //folosim id-ul notitei pentru a naviga
        window.open(`/notita/${data.id}`, '_blank');
    }

    const getContinut = (continut) => {
        //eliminam tag-urile html pentru preview si taiem la 100 de caractere
        return "...";
    }

    return (
        <div className="cardNotita" onClick={handleClick}>
            <div className="headerNotita">
                <span className="etichetaNotita">{data.tip ? data.tip.charAt(0).toUpperCase() + data.tip.slice(1) : 'Curs'}</span>
                <span className="dataNotita">
                    📅 {new Date(data.updatedAt || data.createdAt).toLocaleDateString()}
                </span>
            </div>

            <div className="titluNotita">
                {data.titlu}
            </div>

            <div className="continutNotita">
                {getContinut(data.continut)}
            </div>
        </div>
    );
};

export default Notita;
