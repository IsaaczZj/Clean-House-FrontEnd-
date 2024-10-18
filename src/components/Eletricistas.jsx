import React, { useState, useEffect } from "react";
import NavBarHome from "./NavBarHome";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { useNavigate } from "react-router-dom";
import ptBR from "date-fns/locale/pt-BR";
import "react-datepicker/dist/react-datepicker.css";
import Filtro from "./Filtro";

registerLocale("pt-BR", ptBR);

const Eletricistas = () => {
  // Estados para o filtro
  const [filtroNota, setFiltroNota] = useState("");
  const [precoDe, setPrecoDe] = useState("");
  const [precoAte, setPrecoAte] = useState("");
  const [dataInicial, setDataInicial] = useState(null);
  const [dataFinal, setDataFinal] = useState(null);

  // Estados para os eletricistas
  const [eletricistas, setEletricistas] = useState([]);
  const [filteredEletricistas, setFilteredEletricistas] = useState([]);

  // Estados para o popup de contratação
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [selectedEletricista, setSelectedEletricista] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [observacoes, setObservacoes] = useState("");

  const navigate = useNavigate();

  // Função para buscar eletricistas
  const fetchEletricistas = async () => {
    try {
      const response = await fetch("http://localhost:3000/eletricistas");
      const data = await response.json();
      setEletricistas(data);
      setFilteredEletricistas(data); // Inicializa com todos os eletricistas
    } catch (error) {
      console.error("Erro ao buscar eletricistas:", error);
    }
  };

  // Hook para buscar os eletricistas quando o componente monta
  useEffect(() => {
    fetchEletricistas();
  }, []);

  // Função para aplicar os filtros
  const handleFiltrar = () => {
    const filtered = eletricistas.filter((eletricista) => {
      let matches = true;

      // Filtrar por nota
      if (filtroNota) {
        matches = matches && parseInt(eletricista.nota) === parseInt(filtroNota);
      }
      
      // Filtrar por preço mínimo
      if (precoDe) {
        matches = matches && eletricista.preco >= parseFloat(precoDe);
      }

      // Filtrar por preço máximo
      if (precoAte) {
        matches = matches && eletricista.preco <= parseFloat(precoAte);
      }

      // Filtrar por data (opcional, se tiver dados de disponibilidade)
      // if (dataInicial && dataFinal) {
      //   matches = matches && /* lógica para filtrar por data */;
      // }

      return matches;
    });

    setFilteredEletricistas(filtered);
  };

  // Funções para o popup de contratação
  const handleCheckAvailability = (eletricista) => {
    setSelectedEletricista(eletricista);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedEletricista(null);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setObservacoes("");
  };

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
    setSelectedEndDate(null);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const handleObservacoesChange = (e) => {
    setObservacoes(e.target.value);
  };

  const isEndDateDisabled = !selectedStartDate;

  const formatDateToMySQL = (date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  const handleConfirmation = async () => {
    try {
      const dataInicioFormatted = formatDateToMySQL(selectedStartDate);
      const dataFimFormatted = formatDateToMySQL(selectedEndDate);

      const response = await fetch("http://localhost:3000/contrato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          prestadorId: selectedEletricista.id,
          dataInicio: dataInicioFormatted,
          dataFim: dataFimFormatted,
          observacao: observacoes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao confirmar contratação:", errorData);
      } else {
        console.log("Contratação confirmada com sucesso");
        setShowPopup(false);
        setShowConfirmationPopup(true);
      }
    } catch (error) {
      console.error("Erro ao confirmar contratação:", error);
    }
  };

  const handleRedirect = () => {
    navigate("/pedidos");
  };

  const formatarPreco = (preco) => {
    return `R$ ${parseFloat(preco).toFixed(2)} por diária`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-700">
      <NavBarHome showFAQ={false} />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          Serviços de Eletricista
        </h1>
        <p className="text-center text-lg text-white mb-8">
          Oferecemos serviços de eletricista de alta qualidade, garantindo
          segurança e eficiência.
        </p>

        {/* Componente Filtro */}
        <Filtro
          filtroNota={filtroNota}
          setFiltroNota={setFiltroNota}
          precoDe={precoDe}
          setPrecoDe={setPrecoDe}
          precoAte={precoAte}
          setPrecoAte={setPrecoAte}
          dataInicial={dataInicial}
          setDataInicial={setDataInicial}
          dataFinal={dataFinal}
          setDataFinal={setDataFinal}
          onFiltrar={handleFiltrar}
        />

        {/* Lista de Eletricistas */}
        <h1 className="text-2xl font-semibold text-white text-center mb-6">
          Nossos Eletricistas
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredEletricistas.length > 0 ? (
            filteredEletricistas.map((eletricista) => (
              <div
                key={eletricista.id}
                className="bg-white p-4 rounded-lg shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-sky-700">
                    {eletricista.nome}
                  </h3>
                  <img
                    className="w-20 h-20"
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                    alt=""
                  />
                </div>

                <p className="text-gray-600">{eletricista.titulo}</p>
                <p className="text-gray-600">{eletricista.descricao}</p>
                <p className="font-semibold text-sky-600">
                  {formatarPreco(eletricista.preco)}
                </p>

                {/* Exibir Avaliação */}
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <svg
                      key={index}
                      className={`w-4 h-4 ${
                        index < Math.floor(eletricista.nota)
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.17 3.592a1 1 0 00.95.69h3.862c.969 0 1.371 1.24.588 1.81l-3.124 2.27a1 1 0 00-.364 1.118l1.17 3.592c.3.921-.755 1.688-1.538 1.118l-3.124-2.27a1 1 0 00-1.175 0l-3.124 2.27c-.783.57-1.838-.197-1.538-1.118l1.17-3.592a1 1 0 00-.364-1.118L2.34 9.02c-.783-.57-.38-1.81.588-1.81h3.862a1 1 0 00.95-.69l1.17-3.592z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-500">
                    ({eletricista.nota})
                  </span>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    className="bg-sky-600 text-white p-2 rounded-lg hover:bg-sky-700 w-60"
                    onClick={() => handleCheckAvailability(eletricista)}
                  >
                    Contratar {eletricista.nome}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-white">
              Nenhum eletricista disponível no momento.
            </p>
          )}
        </div>
      </div>

      {/* Popup de Disponibilidade */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold text-sky-700 mb-4">
              Disponibilidade de {selectedEletricista.nome}
            </h2>
            <p className="mb-4">Selecione a data e o horário desejado:</p>

            {/* Data Inicial */}
            <div className="mb-4">
              <p>Data Inicial:</p>
              <DatePicker
                selected={selectedStartDate}
                onChange={handleStartDateChange}
                showTimeSelect
                dateFormat="Pp"
                locale="pt-BR"
                timeFormat="HH:mm"
                timeIntervals={30}
                className="border rounded-lg p-2 w-full"
                placeholderText="Escolha a data inicial"
              />
            </div>

            {/* Data Final */}
            <div className="mb-4">
              <p>Data Final:</p>
              <DatePicker
                selected={selectedEndDate}
                onChange={handleEndDateChange}
                showTimeSelect
                dateFormat="Pp"
                locale="pt-BR"
                timeFormat="HH:mm"
                timeIntervals={30}
                selectsEnd
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                minDate={selectedStartDate}
                className="border rounded-lg p-2 w-full"
                placeholderText="Escolha a data final"
                disabled={isEndDateDisabled}
              />
            </div>

            {/* Observações */}
            <div className="mb-4">
              <p>Observações:</p>
              <textarea
                className="border rounded-lg p-2 w-full"
                value={observacoes}
                onChange={handleObservacoesChange}
                placeholder="Adicione observações (opcional)"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 text-gray-800 p-2 rounded-lg hover:bg-gray-400"
                onClick={closePopup}
              >
                Cancelar
              </button>
              <button
                className="bg-sky-600 text-white p-2 rounded-lg hover:bg-sky-700"
                onClick={handleConfirmation}
                disabled={!selectedStartDate || !selectedEndDate}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Confirmação */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold text-sky-700 mb-4">
              Contratação Confirmada!
            </h2>
            <p className="mb-4">
              A contratação do eletricista {selectedEletricista.nome} foi
              realizada com sucesso!
            </p>
            <div className="flex justify-end">
              <button
                className="bg-sky-600 text-white p-2 rounded-lg hover:bg-sky-700"
                onClick={handleRedirect}
              >
                Ver Solicitações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eletricistas;