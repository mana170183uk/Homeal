"use client";

import { useState, useEffect, use } from "react";
import {
  Star,
  MapPin,
  Clock,
  ChefHat,
  Leaf,
  UtensilsCrossed,
} from "lucide-react";
import { api } from "../../lib/api";
import Header from "../../components/Header";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isVeg: boolean;
  calories: number | null;
  prepTime: number | null;
}

interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

interface Service {
  id: string;
  type: string;
  name: string;
  description: string | null;
  basePrice: number;
}

interface ChefDetail {
  id: string;
  kitchenName: string;
  description: string | null;
  cuisineTypes: string | null;
  bannerImage: string | null;
  avgRating: number;
  totalReviews: number;
  deliveryRadius: number;
  operatingHours: string | null;
  user: { name: string; avatar: string | null };
  menus: Menu[];
  reviews: Review[];
  services: Service[];
}

export default function ChefProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchChef() {
      try {
        const res = await api<ChefDetail>(`/chefs/${id}`);
        if (res.success && res.data) {
          setChef(res.data);
        } else {
          setError("Chef not found.");
        }
      } catch {
        setError("Failed to load chef profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchChef();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
            {error || "Chef not found"}
          </h1>
          <a href="/" className="text-primary font-medium hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  const allItems = chef.menus.flatMap((m) => m.items);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack maxWidth="max-w-5xl" />

      {/* Banner */}
      <div className="h-56 md:h-72 bg-gradient-to-br from-primary/20 to-accent/20 relative">
        {chef.bannerImage && (
          <img
            src={chef.bannerImage}
            alt={chef.kitchenName}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-[1]">
        {/* Chef Info Card */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              {chef.user.avatar ? (
                <img
                  src={chef.user.avatar}
                  alt={chef.user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <ChefHat className="w-10 h-10 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-1">
                {chef.kitchenName}
              </h1>
              <p className="text-[var(--text-soft)] mb-3">
                by {chef.user.name}
              </p>
              {chef.description && (
                <p className="text-[var(--text-soft)] text-sm mb-4">
                  {chef.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {chef.avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">
                      {chef.avgRating.toFixed(1)}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      ({chef.totalReviews} reviews)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[var(--text-muted)]">
                  <MapPin className="w-4 h-4" />
                  Delivers up to {chef.deliveryRadius} km
                </div>
                {allItems.length > 0 && (
                  <div className="flex items-center gap-1 text-[var(--text-muted)]">
                    <UtensilsCrossed className="w-4 h-4" />
                    {allItems.length} dishes
                  </div>
                )}
              </div>
              {chef.cuisineTypes && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {chef.cuisineTypes.split(",").map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                    >
                      {c.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {allItems.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5">
              Menu
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {allItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex gap-4"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {item.isVeg && (
                          <Leaf className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        )}
                        <h3 className="font-semibold text-[var(--text)] truncate">
                          {item.name}
                        </h3>
                      </div>
                      <span className="text-primary font-bold shrink-0">
                        &pound;{item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                      {item.calories && <span>{item.calories} cal</span>}
                      {item.prepTime && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {item.prepTime} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {chef.services.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5">
              Services
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {chef.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[var(--text)]">
                      {service.name}
                    </h3>
                    <span className="text-primary font-bold text-sm">
                      from &pound;{service.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                    {service.type.replace(/_/g, " ")}
                  </span>
                  {service.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {chef.reviews.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5">
              Reviews
            </h2>
            <div className="space-y-4">
              {chef.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                      {review.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text)]">
                        {review.user.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-[var(--text-muted)]">
                      {new Date(review.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[var(--text-soft)]">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
