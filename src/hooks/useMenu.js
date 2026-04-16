import { useState, useEffect } from "react";

export function useMenu(handle) {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menus");
        const data = await res.json();
        
        if (data.success) {
          const mainMenu = data.menus.find(m => m.handle === handle);
          if (mainMenu) {
            setMenuData(transformMenu(mainMenu));
          } else {
            setError("Menu not found");
          }
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [handle]);

  return { menuData, loading, error };
}

function transformMenu(shopifyMenu) {
  return shopifyMenu.items.map(item => {
    const resource = item.resource || {};
    const metafields = resource.metafields?.nodes || [];
    
    const menuType = getMetafield(metafields, "custom", "menu_type")?.value || (item.items?.length > 0 ? "mega" : "link");
    const layout = getMetafield(metafields, "custom", "layout")?.value || "5-col-featured";
    
    let transformedItem = {
      label: item.title,
      href: item.url.replace(/https:\/\/[^/]+/, ""), // Strip domain
      type: menuType,
      layout: layout,
    };

    if (menuType === "mega") {
        const children = item.items || [];
        
        const featuredGroup = children.find(c => c.title.toLowerCase() === "featured");
        if (featuredGroup) {
            transformedItem.featured = featuredGroup.items.map(f => ({
                label: f.title,
                href: f.url.replace(/https:\/\/[^/]+/, "")
            }));
        }

        const columnGroups = children.filter(c => c.title.toLowerCase() !== "featured");
        transformedItem.columns = columnGroups.map(col => {
            const colResource = col.resource || {};
            const colMetafields = colResource.metafields?.nodes || [];
            
            return {
                title: col.title,
                type: getMetafield(colMetafields, "custom", "column_type")?.value || "text",
                items: col.items?.map(sub => ({
                    label: sub.title,
                    href: sub.url.replace(/https:\/\/[^/]+/, ""),
                    icon: getFileUrl(getMetafield(sub.resource?.metafields?.nodes || [], "custom", "icon"))
                })) || []
            };
        });

        const bannerMeta = getMetafield(metafields, "custom", "banner_image");
        const bannerImage = getFileUrl(bannerMeta) || resource.image?.url;
        
        if (bannerImage) {
            transformedItem.banner = {
                image: bannerImage,
                title: getMetafield(metafields, "custom", "banner_title")?.value || item.title,
                subtitle: getMetafield(metafields, "custom", "banner_subtitle")?.value,
                href: transformedItem.href
            };
        }
    } else if (menuType === "image-grid") {
        transformedItem.items = item.items?.map(sub => {
            const subResource = sub.resource || {};
            const subMeta = subResource.metafields?.nodes || [];
            return {
                title: sub.title,
                description: getMetafield(subMeta, "custom", "description")?.value,
                image: getFileUrl(getMetafield(subMeta, "custom", "image")) || subResource.image?.url,
                href: sub.url.replace(/https:\/\/[^/]+/, "")
            };
        });
    }

    return transformedItem;
  });
}

function getMetafield(metafields, namespace, key) {
  return metafields.find(m => m.namespace === namespace && m.key === key);
}

function getFileUrl(metafield) {
    if (!metafield) return null;
    if (metafield.reference?.image?.url) return metafield.reference.image.url;
    if (metafield.reference?.url) return metafield.reference.url;
    return null;
}
