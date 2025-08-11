"use client"
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Page = () => {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link 
            href="/budget/lab-budget-2025"
            className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Armado de Presupuesto</h1>
            <p className="text-gray-600 mt-1">Selecciona el tipo de presupuesto que deseas armar</p>
          </div>
        </div>

        {/* Main Budget Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Presupuestos - Facultad de Ingeniería</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <Link
              href="/armado/ingenieria"
              className="block bg-white hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-900">Presupuesto de Ingeniería</h3>
              <p className="text-gray-600 mt-2">Presupuesto general de la Facultad de Ingeniería</p>
            </Link>
          </div>
        </div>

        {/* Sub-areas Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Presupuestos de las sub áreas de la facultad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/armado/laboratorio"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Laboratorio</h3>
              <p className="text-gray-600 text-sm">Gestión del presupuesto del laboratorio de investigación</p>
            </Link>

            <Link
              href="/armado/biomedica"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Facultad Biomédica</h3>
              <p className="text-gray-600 text-sm">Presupuesto específico para el área biomédica</p>
            </Link>

            <Link
              href="/armado/informatica"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Informática</h3>
              <p className="text-gray-600 text-sm">Gestión presupuestaria del departamento de informática</p>
            </Link>

            <Link
              href="/armado/industrial"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Ingeniería Industrial</h3>
              <p className="text-gray-600 text-sm">Presupuesto del área de ingeniería industrial</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;