
'use client';

import { useState } from 'react';
import { Piece } from '../types';
import { mockPieces } from '../mockData';
import PerformanceList from './PerformanceList';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

let pieceCounter = mockPieces.length;

export default function PieceList() {
  const [pieces, setPieces] = useState<Piece[]>(mockPieces);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  const addPiece = () => {
    pieceCounter++;
    const newPiece: Piece = {
      id: `piece-${pieceCounter}`,
      name: `New Piece ${pieceCounter}`,
      performances: [],
    };
    setPieces([...pieces, newPiece]);
  };

  const deletePiece = (id: string) => {
    setPieces(pieces.filter((piece) => piece.id !== id));
    if (selectedPiece?.id === id) {
      setSelectedPiece(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Pieces</h2>
        <button onClick={addPiece} className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          +
        </button>
      </div>
      <div className="space-y-4">
        {pieces.map((piece) => (
          <div key={piece.id} className="glass-pane p-4 transition-all duration-300">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setSelectedPiece(selectedPiece?.id === piece.id ? null : piece)}
            >
              <span className="font-semibold text-lg">{piece.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); deletePiece(piece.id); }} className="btn-icon">
                  <TrashIcon className="h-5 w-5 text-red-400" />
                </button>
                {selectedPiece?.id === piece.id ? (
                  <ChevronUpIcon className="h-6 w-6" />
                ) : (
                  <ChevronDownIcon className="h-6 w-6" />
                )}
              </div>
            </div>
            {selectedPiece?.id === piece.id && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <PerformanceList performances={selectedPiece.performances} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
