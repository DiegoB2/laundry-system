import { createSlice } from "@reduxjs/toolkit";
import {
  AddOrdenServices,
  AnularRemplazar_OrdensService,
  Anular_OrdenService,
  CancelEntrega_OrdenService,
  Entregar_OrdenService,
  FinalzarReservaOrdenService,
  GetOrdenServices_Date,
  GetOrdenServices_DateRange,
  Nota_OrdenService,
  UpdateDetalleOrdenServices,
} from "../actions/aOrdenServices";
import { handleGetInfoPago } from "../../utils/functions";
import moment from "moment";

const service_order = createSlice({
  name: "service_order",
  initialState: {
    infoServiceOrder: false,
    registered: [],
    reserved: [],
    lastRegister: null,
    orderServiceId: false,
    // filtros
    filterBy: "date",
    searhOptionByDate: "latest",
    selectedMonth: moment().subtract(2, "months").toDate(),
    // ----------------- //
    isLoading: false,
    error: null,
  },
  reducers: {
    // Filtros
    setFilterBy: (state, action) => {
      state.filterBy = action.payload;
    },
    setSearchOptionByDate: (state, action) => {
      state.searhOptionByDate = action.payload;
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    // ----------------------------------------- //
    updateLastRegister: (state, action) => {
      state.lastRegister = {
        ...state.lastRegister,
        promotions: action.payload,
      };
    },
    setLastRegister: (state) => {
      state.lastRegister = null;
    },
    // UPDATE INFO ORDEN
    updateDetalleOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );
      state.registered[index].Items = action.payload.Items;
    },
    updateFinishReserva: (state, action) => {
      // Quitar Orden de Reserva
      state.reserved = state.reserved.filter(
        (item) => item._id !== action.payload._id
      );

      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        // si existe acutaliza
        state.registered[index] = action.payload;
      } else {
        // si no y agregalo
        if (action.payload.estado === "registrado") {
          state.registered.push(action.payload);
        }
      }
    },
    updateEntregaOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );

      if (index !== -1) {
        const updatedOrder = state.registered[index];
        updatedOrder.estadoPrenda = action.payload.estadoPrenda;
        updatedOrder.location = action.payload.location;
        updatedOrder.dateEntrega = action.payload.dateEntrega;
      }
    },
    updateCancelarEntregaOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );

      if (index !== -1) {
        const updatedOrder = state.registered[index];
        updatedOrder.estadoPrenda = action.payload.estadoPrenda;
        updatedOrder.dateEntrega = action.payload.dateEntrega;
      }
    },
    updateAnulacionOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );

      if (index !== -1) {
        const updatedOrder = state.registered[index];
        updatedOrder.estadoPrenda = action.payload.estadoPrenda;
      }
    },
    updateNotaOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );

      if (index !== -1) {
        const updatedOrder = state.registered[index];
        updatedOrder.notas = action.payload.notas;
      }
    },
    updateStateLavadoOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );

      if (index !== -1) {
        const updatedOrder = state.registered[index];
        updatedOrder.stateLavado = action.payload.stateLavado;
      }
    },
    // ---------------------- //
    LS_updateListOrder: (state, action) => {
      const listOrderUpdated = action.payload;
      listOrderUpdated.map((order) => {
        // Busca si existe un elemento con el mismo _id en state.registered
        const eRegistered = state.registered.findIndex(
          (item) => item._id === order._id
        );
        if (eRegistered !== -1) {
          // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
          Object.assign(state.registered[eRegistered], order);
        }
      });
    },
    LS_newOrder: (state, action) => {
      if (action.payload.estado === "reservado") {
        state.reserved.push(action.payload);
      }

      if (action.payload.estado === "registrado") {
        state.registered.push(action.payload);
      }
    },
    LS_changeListPago: (state, action) => {
      const { tipo, info } = action.payload;

      // Buscar la orden por su _id
      const orderToUpdateIndex = state.registered.findIndex(
        (order) => order._id === info.idOrden
      );

      // Verificar si se encontró la orden
      if (orderToUpdateIndex === -1) {
        console.error("Orden no encontrada");
        return;
      }

      // Clonar la orden para no mutar el estado directamente
      const orderToUpdate = { ...state.registered[orderToUpdateIndex] };

      let indexPago;
      if (tipo !== "added") {
        // Buscar el pago dentro de ListPago por su _id
        indexPago = orderToUpdate.ListPago.findIndex(
          (pago) => pago._id === info._id
        );

        // Verificar si se encontró el pago
        if (indexPago === -1) {
          console.error("Pago no encontrado");
          return;
        }
      }

      // Realizar la acción según el tipo
      if (tipo === "deleted") {
        // Eliminar el pago del array ListPago
        orderToUpdate.ListPago.splice(indexPago, 1);
      } else if (tipo === "updated") {
        // Actualizar el pago con la nueva información
        orderToUpdate.ListPago[indexPago] = info;
      } else if (tipo === "added") {
        // Verificar si el pago ya existe en ListPago
        if (!orderToUpdate.ListPago.some((pago) => pago._id === info._id)) {
          // Agregar el nuevo pago a ListPago solo si no existe
          orderToUpdate.ListPago.push(info);
        }
      }

      orderToUpdate.Pago = handleGetInfoPago(
        orderToUpdate.ListPago,
        orderToUpdate.totalNeto
      ).estado.toUpperCase();

      // Actualizar la orden en state.registered
      state.registered[orderToUpdateIndex] = orderToUpdate;
    },
    LS_changePagoOnOrden: (state, action) => {
      const { tipo, info } = action.payload;

      // Encontrar la orden por su _id
      const orderIndex = state.registered.findIndex(
        (order) => order._id === info.idOrden
      );

      // Verificar si la orden existe
      if (orderIndex === -1) {
        console.error("Orden no encontrada:", info.idOrden);
        return;
      }

      const order = state.registered[orderIndex];
      let updatedPagoIndex, existingPagoIndex; // Declaraciones fuera del switch

      // Realizar la acción según el tipo
      switch (tipo) {
        case "deleted":
          // Eliminar el pago del array ListPago
          order.listPago.splice(order.listPago.indexOf(info._id), 1);
          break;
        case "updated":
          // Buscar el pago por su _id y actualizarlo con la nueva información
          updatedPagoIndex = order.listPago.findIndex(
            (pagoId) => pagoId === info._id
          );
          if (updatedPagoIndex !== -1) {
            order.listPago[updatedPagoIndex] = info._id;
          } else {
            console.error("Pago no encontrado para actualizar:", info._id);
          }
          break;
        case "added":
          // Verificar si el pago ya existe en ListPago
          existingPagoIndex = order.listPago.indexOf(info._id);
          if (existingPagoIndex === -1) {
            // Agregar el nuevo pago a ListPago solo si no existe
            order.listPago.push(info._id);
          } else {
            console.error("El pago ya existe en ListPago:", info._id);
          }
          break;
        default:
          console.error("Tipo de acción no válido:", tipo);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(AddOrdenServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(AddOrdenServices.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.estado === "reservado") {
          state.reserved.push(action.payload);
        }

        if (action.payload.estado === "registrado") {
          state.registered.push(action.payload);
        }

        state.lastRegister = action.payload;
      })
      .addCase(AddOrdenServices.rejected, (state) => {
        state.isLoading = false;
      })
      // Update Items
      .addCase(UpdateDetalleOrdenServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(UpdateDetalleOrdenServices.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );
        state.registered[index].Items = action.payload.Items;
      })
      .addCase(UpdateDetalleOrdenServices.rejected, (state) => {
        state.isLoading = false;
      })
      // Finalizar Reserva
      .addCase(FinalzarReservaOrdenService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(FinalzarReservaOrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reserved = state.reserved.filter(
          (item) => item._id !== action.payload._id
        );
        state.registered.push(action.payload);
      })
      .addCase(FinalzarReservaOrdenService.rejected, (state) => {
        state.isLoading = false;
      })
      // Update Entregar
      .addCase(Entregar_OrdenService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(Entregar_OrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          const updatedOrder = state.registered[index];
          updatedOrder.stateLavado = action.payload.stateLavado;
          updatedOrder.estadoPrenda = action.payload.estadoPrenda;
          updatedOrder.location = action.payload.location;
          updatedOrder.dateEntrega = action.payload.dateEntrega;
        }
      })
      .addCase(Entregar_OrdenService.rejected, (state) => {
        state.isLoading = false;
      })
      // Update Cancelar Entrega
      .addCase(CancelEntrega_OrdenService.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(CancelEntrega_OrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          const updatedOrder = state.registered[index];
          updatedOrder.estadoPrenda = action.payload.estadoPrenda;
          updatedOrder.dateEntrega = action.payload.dateEntrega;
        }
      })
      .addCase(CancelEntrega_OrdenService.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // Update Anulacion
      .addCase(Anular_OrdenService.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(Anular_OrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          const updatedOrder = state.registered[index];
          updatedOrder.estadoPrenda = action.payload.estadoPrenda;
          updatedOrder.stateLavado = action.payload.stateLavado;
        }
      })
      .addCase(Anular_OrdenService.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // Update Nota
      .addCase(Nota_OrdenService.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(Nota_OrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          const updatedOrder = state.registered[index];
          updatedOrder.notas = action.payload.notas;
        }
      })
      .addCase(Nota_OrdenService.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // Anular y Remplazar
      .addCase(AnularRemplazar_OrdensService.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(AnularRemplazar_OrdensService.fulfilled, (state, action) => {
        state.isLoading = false;
        const { newOrder, orderAnulado } = action.payload;
        const indexOrderToAnular = state.registered.findIndex(
          (item) => item._id === orderAnulado._id
        );

        if (indexOrderToAnular !== -1) {
          const updatedOrder = state.registered[indexOrderToAnular];
          updatedOrder.estadoPrenda = orderAnulado.estadoPrenda;
        }

        state.registered.push(newOrder);

        state.lastRegister = newOrder;
      })
      .addCase(AnularRemplazar_OrdensService.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // List for Date Range
      .addCase(GetOrdenServices_DateRange.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(GetOrdenServices_DateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = action.payload.length > 0;
        state.reserved = action.payload.filter(
          (item) => item.estado === "reservado"
        );
        state.registered = action.payload.filter(
          (item) => item.estado === "registrado"
        );
      })
      .addCase(GetOrdenServices_DateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // List for Date
      .addCase(GetOrdenServices_Date.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(GetOrdenServices_Date.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = action.payload.length > 0;
        state.reserved = action.payload.filter(
          (item) => item.estado === "reservado"
        );
        state.registered = action.payload.filter(
          (item) => item.estado === "registrado"
        );
      })
      .addCase(GetOrdenServices_Date.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setLastRegister,
  updateNotaOrden,
  updateStateLavadoOrden,
  updateDetalleOrden,
  updateFinishReserva,
  updateEntregaOrden,
  updateCancelarEntregaOrden,
  updateAnulacionOrden,
  updateLastRegister,
  LS_newOrder,
  LS_updateListOrder,
  LS_changeListPago,
  LS_changePagoOnOrden,
  // Filter
  setFilterBy,
  setSearchOptionByDate,
  setSelectedMonth,
} = service_order.actions;
export default service_order.reducer;
