import NavBar from '../UI/NavBar/NavBar';
import MapComponent from '../UI/Map/MapComponent';
import Loading from '../UI/Loading/Loading';
import Button from '../UI/Button/Button';
import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import './PaginaBarbearia.css';
import { UserContext } from '../User/UserContext';

const url = process.env.REACT_APP_BASE_URL;

export default function PaginaBarbearia(){
    const history = useHistory();
    const { id } = useParams();
    const { webarberUser } = useContext(UserContext);
    const [dadosBarbearia, setDadosBarberia] = useState();
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(false);

    const fieldNameDictionary = {
            nome: "Nome", endereço: "Endereço", numero: "Número", complemento:"Complemento", bloco:"Bloco",
            cep:"CEP", telefone:"Telefone", horarioAbertura:"Horário Abertura", horarioFechamento:"Horário Fechamento"
        }
    
    const fetchBarbearia = async() => {
        setLoading(true);
        try{
            const barbearia = await axios.get(`${url}/barbearias/${id}`).then(d=>d.data);
            barbearia.horarioAbertura =  new Date(barbearia.horarioAbertura).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit", hour12:false})
            barbearia.horarioFechamento = new Date(barbearia.horarioFechamento).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit", hour12:false})
            setDadosBarberia(barbearia);
        }
        catch(err){
            console.log(err);
        }
        setLoading(false);
    }
    
    const fetchServicos = async () => {
        try {
            let barbearia_id = await fetch(`${url}/barbearia`, {
				method: "get",
				headers: new Headers({
					"Content-Type": "application/json","Authorization": `Bearer ${webarberUser.sessionToken}`
				}),
            });
            barbearia_id = await barbearia_id.json();
            barbearia_id = barbearia_id.id;

            const servicos = await axios.get(`${url}/servicos/barbearia/${barbearia_id}`).then(d=>d.data);
            setServicos(servicos);
        } catch(err){
            console.log(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchBarbearia();
        fetchServicos(); 
    }, []);

    const renderBarbeariaDataRows = (field, value) =>{
        if(fieldNameDictionary[field]){
            return(
                <div className="row" style={{justifyContent:"center", display:"flex"}}>
                    <div className="col barberField">
                        {fieldNameDictionary[field]}
                    </div>
                    <div className="col barberData">
                        {value ? value : "Sem Informações"}
                    </div>
                </div>
            )
        }
    }

    const buttonStyle = {
        display: "flex",
        justifyContent:"center",
        margin: "10px auto"
    }

       const tableRow = (obj) => {
        return <tr key={`row-${obj.id}`}>
            <td data-testid={`titulo-${obj.id}`} key={`titulo-${obj.id}`}>{obj.titulo}</td>
            {/* <td data-testid={`descricao-${obj.id}`} key={`descricao-${obj.id}`}>{obj.descricao}</td> */}
            <td data-testid={`valor-${obj.id}`} key={`valor-${obj.id}`}>{obj.preco}</td>
        </tr>
    }

    const renderEditButton = () => {
        return(
                <Button buttonColors={2} buttonText="Editar Barbearia" style={buttonStyle} handleOnClick={()=>history.push(`/editarBarbearia/${id}`)}/>
        )
    }

    const renderServiceButton = () => {
        return(
            <Button buttonColors={1} buttonText="Adicionar Serviço" style={buttonStyle} handleOnClick={()=>history.push(`/cadastrarServico`)}/>
        )
    }

    const renderPaginaBarbearia = () =>{
        return (
                <div style={{width:"max-content%", display:"flex", margin:"auto"}}>
                    <div className="barberPage">
                        <div className="card-title barber">
                            <h1 className="title barber">
                                {dadosBarbearia.nome}
                            </h1>
                        </div>
                        <div className="card-body">
                        {dadosBarbearia && Object.keys(dadosBarbearia).map(field=>renderBarbeariaDataRows(field, dadosBarbearia[field]))}
                        <table class="table table-dark">
                            <thead>
                                <tr>
                                    <th key="titulo" data-testid="titulo">Titulo</th>
                                    <th key="valor" data-testid="Valor">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicos && servicos.map(obj => tableRow(obj))}
                            </tbody>
                        </table>
                        {webarberUser.id === dadosBarbearia.user_id && renderEditButton()}
                        {webarberUser.id === dadosBarbearia.user_id && renderServiceButton()}
                        </div>
                    </div>
                    <MapComponent nomeBarbearia={dadosBarbearia.nome} endereco={dadosBarbearia.endereco}></MapComponent>
                </div>
        );
    }

    const renderNotFound = () =>{
        return (
            <h1 className="notFound">
                Barbearia não encontrada
            </h1>
        );
    }

    return (
        <div>
            <NavBar></NavBar>
            {loading && <Loading/>}
            {dadosBarbearia && dadosBarbearia.ativo ? renderPaginaBarbearia(): renderNotFound()}
            
        </div>
    );
}