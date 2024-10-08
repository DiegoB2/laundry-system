/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import ReactToPrint from "react-to-print";
import Ticket from "./Ticket/Ticket";
import whatsappApp from "./whatsappApp.png";
import "./imprimir.scss";
import SwtichModel from "../../../../../../components/SwitchModel/SwitchModel";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Notify } from "../../../../../../utils/notify/Notify";
import { codigoPhonePais } from "../../../../../../services/global";

import { WSendMessage } from "../../../../../../services/default.services";

const index = () => {
  const { id } = useParams();
  const infoOrden = useSelector((state) =>
    state.orden.registered.find((item) => item._id === id)
  );
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const [showDescripcion, setDescription] = useState(false);
  const [tipoTicket, setTipoTicket] = useState(false);
  const [phoneA, setPhoneA] = useState(
    infoOrden.celular
      ? `${codigoPhonePais}${infoOrden.celular.replace(/\s/g, "")}`
      : ""
  );
  const componentRef = React.useRef();

  const handleSendMessage = () => {
    const number = phoneA;

    if (number) {
      const mensaje = `Hola! *${infoOrden.Nombre}* 👋
Le saluda la *LAVANDERIA ${InfoNegocio.name}* 😃
Su orden de pedido es *#${infoOrden.codRecibo}* ✏
  
Estamos *PROCESANDO* su pedido 🌀
Le enviaremos un mensaje 🥏 cuando esté listo
  
*RECUERDA* registrar este contacto ✍`;

      for (let index = 0; index < 2; index++) {
        WSendMessage(mensaje, number);
      }
    } else {
      Notify("Cliente sin número", "", "fail");
    }
  };

  return (
    <div className="content-to-print">
      <div className="action-to-print">
        <ReactToPrint
          trigger={() => (
            <button type="button" className="btn-imprimir">
              Imprimir Ticket
            </button>
          )}
          content={() => componentRef.current}
        />
        {phoneA ? (
          <div className="send-whatsapp">
            <button
              type="button"
              onClick={() => {
                handleSendMessage("App");
              }}
              className="btn-send-whatsapp app"
            >
              <img src={whatsappApp} alt="" />
            </button>
            <div className="info-cel">
              <label htmlFor="">Numero Celular :</label>
              <input
                type="number"
                onDragStart={(e) => e.preventDefault()}
                defaultValue={phoneA}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const validInput = inputValue
                    ? inputValue.replace(/[^0-9.]/g, "")
                    : "";
                  setPhoneA(validInput);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="actions">
        <SwtichModel
          title="Tipo Ticket :"
          onSwitch="Produccion" // ON = TRUE
          offSwitch="Cliente" // OFF = FALSE
          name="tipo"
          defaultValue={false}
          colorBackground="#D5A040" // COLOR FONDO
          onChange={() => {
            // value = (TRUE O FALSE)
            setTipoTicket(!tipoTicket);
          }}
        />
        <SwtichModel
          title="Descripcion :"
          onSwitch="Mostrar" // ON = TRUE
          offSwitch="Ocultar" // OFF = FALSE
          name="descripcion"
          defaultValue={false}
          colorBackground="#45c877" // COLOR FONDO
          onChange={() => {
            // value = (TRUE O FALSE)
            setDescription(!showDescripcion);
          }}
        />
      </div>
      <Ticket
        ref={componentRef}
        showDescripcion={showDescripcion}
        tipoTicket={tipoTicket}
        infoOrden={infoOrden}
        InfoNegocio={InfoNegocio}
      />
    </div>
  );
};

export default index;
