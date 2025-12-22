import React from 'react';
import { Plus } from 'lucide-react';
import type { Package } from '../types';

interface SubscriptionsProps {
  packages: Package[];
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ packages }) => {
  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      subscription: { class: 'bg-primary', text: 'Συνδρομή' },
      hourly: { class: 'bg-info', text: 'Ωριαία' },
      kids: { class: 'bg-success', text: 'Παιδικό' },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { class: 'bg-secondary', text: category };
    
    return (
      <span className={`badge ${config.class} text-white`}>
        {config.text}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <h2 className="h4 mb-3 mb-md-0">Πακέτα Συνδρομών</h2>
        <button className="btn btn-primary">
          <Plus size={16} className="me-2" />
          Νέο Πακέτο
        </button>
      </div>

      {/* Packages Grid */}
      <div className="row g-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <h5 className="card-title mb-0">{pkg.name}</h5>
                  {getCategoryBadge(pkg.category)}
                </div>
                
                <div className="mb-4">
                  <div className="row g-2 mb-2">
                    <div className="col-12">
                      <small className="text-muted d-block">Διάρκεια</small>
                      <span className="text-dark">{pkg.duration}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-3">
                    <div className="display-6 fw-bold text-primary">€{pkg.price}</div>
                  </div>
                  
                  <div className="text-center">
                    <small className="text-muted d-block">Ενεργά μέλη</small>
                    <span className="fw-semibold text-dark">{pkg.active}</span>
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-secondary btn-sm">
                    Επεξεργασία
                  </button>
                  <button className="btn btn-primary btn-sm">
                    Ανανέωση
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <Plus size={32} className="text-muted" />
            </div>
          </div>
          <h5 className="text-muted">Δεν υπάρχουν πακέτα συνδρομών</h5>
          <p className="text-muted mb-4">Δημιουργήστε το πρώτο πακέτο συνδρομής για να ξεκινήσετε</p>
          <button className="btn btn-primary">
            <Plus size={16} className="me-2" />
            Δημιουργία Πακέτου
          </button>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
