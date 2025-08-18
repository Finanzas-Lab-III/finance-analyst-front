"use client"
import React from "react";
import Link from "next/link";

const DirectorsHomePage = () => {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Presupuestos</h1>
            <p className="text-gray-600 mt-1">Administra y supervisa todos los presupuestos de manera centralizada</p>
          </div>
        </div>

        {/* Main Budget Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Presupuestos - Facultad de Ingeniería</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <Link
              href="/presupuesto/ingenieria"
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
              href="/presupuesto/laboratorio"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Laboratorio</h3>
              <p className="text-gray-600 text-sm">Gestión del presupuesto del laboratorio de investigación</p>
            </Link>

            <Link
              href="/presupuesto/biomedica"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Facultad Biomédica</h3>
              <p className="text-gray-600 text-sm">Presupuesto específico para el área biomédica</p>
            </Link>

            <Link
              href="/presupuesto/informatica"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Informática</h3>
              <p className="text-gray-600 text-sm">Gestión presupuestaria del departamento de informática</p>
            </Link>

            <Link
              href="/presupuesto/industrial"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Ingeniería Industrial</h3>
              <p className="text-gray-600 text-sm">Presupuesto del área de ingeniería industrial</p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Sistema de Gestión de Presupuestos - Universidad © 2025
          </p>
        </div>
      </div>
    </main>
  );
};

export default DirectorsHomePage;
