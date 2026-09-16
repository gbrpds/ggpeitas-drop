"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { sizeChartMasculino, sizeChartFeminino } from "@/data/size-chart";

export function SizeChart({ defaultGender = "masculino" }: { defaultGender?: "masculino" | "feminino" }) {
  const [gender, setGender] = useState<"masculino" | "feminino">(defaultGender);
  const rows = gender === "feminino" ? sizeChartFeminino : sizeChartMasculino;

  return (
    <section className="wrap sizechart">
      <h2 className="sizechart-title"><Ruler size={20} /> Tabela de medidas</h2>
      <p className="sizechart-lead">
        As camisas importadas tendem a vestir um pouco mais justo. Na dúvida entre dois tamanhos, suba um.
      </p>
      <div className="sizechart-toggle">
        <button className={gender === "masculino" ? "on" : ""} onClick={() => setGender("masculino")}>Masculino</button>
        <button className={gender === "feminino" ? "on" : ""} onClick={() => setGender("feminino")}>Feminino</button>
      </div>
      <div className="sizechart-scroll">
        <table className="sizechart-table">
          <thead>
            <tr><th>Tamanho</th><th>Largura (cm)</th><th>Comprimento (cm)</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size}>
                <td><b>{r.size}</b></td>
                <td>{r.largura}</td>
                <td>{r.comprimento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sizechart-note">
        Medidas com a peça no plano. <b>Largura</b>: de uma axila à outra. <b>Comprimento</b>: do ombro à barra.
        Pode variar ±2 cm de acordo com o modelo.
      </p>
    </section>
  );
}
