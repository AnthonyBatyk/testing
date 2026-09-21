document.addEventListener("DOMContentLoaded", async () => {

  /* =========================================================
     SUPABASE
  ========================================================= */

  const SUPABASE_URL =
    "https://hbyeycsoxedzvapesrwq.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_uSR9bn7YeGiy-PTKlUTBNw_ZQtL5Icn";

  const supabaseClient =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    ) || null;


  /* =========================================================
     DOM HELPERS
  ========================================================= */

  const $ = id =>
    document.getElementById(id);


  const tabs =
    [...document.querySelectorAll(".tab")];

  const pages =
    [...document.querySelectorAll(".page")];


  const grid =
    $("grid");

  const searchInput =
    $("search");

  const clearSearch =
    $("clear-search");


  const productModal =
    $("product-modal");

  const addProductModal =
    $("add-product-modal");

  const deleteProductModal =
    $("delete-product-modal");

  const archiveTextModal =
    $("archive-text-modal");


  /* =========================================================
     STATE
  ========================================================= */

  let products = [];

  let calculatorItems = [];

  let archiveItems = [];


  let selectedProduct = null;

  let editingProductId = null;

  let archiveEditingId = null;

  let archiveOriginalText = null;


  let reorderMode = false;

  let reorderChanged = false;

  let draggedCard = null;


  let activeStatsMetric = "kcal";


  /* =========================================================
     LOCAL STORAGE
  ========================================================= */

  const LS = {

    products:
      "kbjv_products",

    calculator:
      "kbjv_calculator",

    archive:
      "kbjv_archive",

    draft:
      "kbjv_calculator_draft",

    activeTab:
      "kbjv_active_tab",

    console:
      "kbjv_console",

    productVersion:
      "kbjv_product_export_version",

    productSnapshot:
      "kbjv_product_export_snapshot",

    archiveVersion:
      "kbjv_archive_export_version",

    archiveSnapshot:
      "kbjv_archive_export_snapshot"

  };


  /* =========================================================
     HELPERS
  ========================================================= */

  function number(value) {

    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  }


  function round(
    value,
    digits = 1
  ) {

    const power =
      10 ** digits;

    return Math.round(
      number(value) * power
    ) / power;
  }


  function formatNumber(
    value,
    digits = 1
  ) {

    return round(
      value,
      digits
    ).toFixed(digits);
  }


  function escapeHTML(value) {

    const element =
      document.createElement("div");

    element.textContent =
      value ?? "";

    return element.innerHTML;
  }


  function createId() {

    return (
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );

  }


  function getInitials(name) {

    return (
      String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
        || "?"
    );

  }


  function now() {

    return new Date().toISOString();

  }


  function prettyTime(value) {

    try {

      return new Date(value)
        .toLocaleString("uk-UA");

    } catch {

      return value;

    }

  }


  /* =========================================================
     BUTTON STATUS
  ========================================================= */

  function showButtonState(
    button,
    text,
    state,
    original,
    duration = 1500
  ) {

    if (!button) {
      return;
    }

    const old =
      original ??
      button.dataset.original ??
      button.textContent;

    button.dataset.original =
      old;

    button.textContent =
      text;

    button.classList.add(
      state
    );

    clearTimeout(
      button._stateTimer
    );

    button._stateTimer =
      setTimeout(() => {

        button.textContent =
          old;

        button.classList.remove(
          state
        );

      }, duration);

  }


  /* =========================================================
     NORMALIZE PRODUCT
  ========================================================= */

  function normalizeProduct(product) {

    return {

      id:
        product.id ??
        createId(),

      name:
        String(
          product.name ??
          ""
        ).trim(),

      unit:
        product.unit === "мл"
          ? "мл"
          : "г",

      kcal:
        number(product.kcal),

      protein:
        number(product.protein),

      fat:
        number(product.fat),

      carb:
        number(
          product.carb ??
          product.carbs
        ),

      sugars:
        number(
          product.sugars ??
          product.sugar ??
          0
        ),

      salt:
        number(
          product.salt ??
          0
        ),

      full_name:
        String(
          product.full_name ??
          product.description ??
          ""
        ).trim(),

      barcode:
        product.barcode ??
        null

    };

  }


  /* =========================================================
     DATABASE SNAPSHOT
  ========================================================= */

  function getProductsSnapshot(
    list = products
  ) {

    return JSON.stringify(
      list.map(product => ({

        id:
          product.id ?? null,

        name:
          String(
            product.name || ""
          ),

        unit:
          product.unit === "мл"
            ? "мл"
            : "г",

        kcal:
          round(
            product.kcal,
            4
          ),

        protein:
          round(
            product.protein,
            4
          ),

        fat:
          round(
            product.fat,
            4
          ),

        carb:
          round(
            product.carb ??
            product.carbs,
            4
          ),

        sugars:
          round(
            product.sugars ??
            product.sugar,
            4
          ),

        salt:
          round(
            product.salt,
            4
          ),

        full_name:
          String(
            product.full_name ??
            product.description ??
            ""
          ),

        barcode:
          product.barcode ??
          null

      }))
    );

  }


  function getArchiveSnapshot(
    list = archiveItems
  ) {

    return JSON.stringify(
      list.map(item => ({

        id:
          item.id,

        date:
          item.date,

        text:
          item.text,

        created_at:
          item.created_at ??
          null

      }))
    );

  }


  /* =========================================================
     CHANGE CONSOLE
  ========================================================= */

  function logConsole(
    action,
    details = ""
  ) {

    let entries = [];

    try {

      entries =
        JSON.parse(
          localStorage.getItem(
            LS.console
          ) || "[]"
        );

    } catch {

      entries = [];

    }


    entries.unshift({

      id:
        createId(),

      at:
        now(),

      action,

      details

    });


    localStorage.setItem(
      LS.console,
      JSON.stringify(
        entries.slice(0, 500)
      )
    );


    renderConsole();

  }


  function renderConsole() {

    const box =
      $("console-log");

    if (!box) {
      return;
    }


    let entries = [];

    try {

      entries =
        JSON.parse(
          localStorage.getItem(
            LS.console
          ) || "[]"
        );

    } catch {

      entries = [];

    }


    if (!entries.length) {

      box.innerHTML = `
        <div class="stats-empty">
          Історія змін порожня.
        </div>
      `;

      return;

    }


    box.innerHTML =
      entries
        .map(entry => `

          <div class="console-entry">

            <span class="console-time">
              ${escapeHTML(
                prettyTime(entry.at)
              )}
            </span>

            <span class="console-action">
              ${escapeHTML(
                entry.action
              )}
            </span>

            ${
              entry.details
                ? ` — ${escapeHTML(
                    entry.details
                  )}`
                : ""
            }

          </div>

        `)
        .join("");

  }


  $("clear-console")
    ?.addEventListener(
      "click",
      () => {

        if (
          !confirm(
            "Очистити історію змін бази?"
          )
        ) {
          return;
        }


        localStorage.removeItem(
          LS.console
        );

        renderConsole();

      }
    );


  /* =========================================================
     LOCAL PRODUCTS
  ========================================================= */

  function loadProductsLocal() {

    try {

      const data =
        JSON.parse(
          localStorage.getItem(
            LS.products
          ) || "[]"
        );


      return Array.isArray(data)
        ? data
            .map(normalizeProduct)
            .filter(
              product =>
                product.name
            )
        : [];

    } catch {

      return [];

    }

  }


  function saveProductsLocal() {

    localStorage.setItem(
      LS.products,
      JSON.stringify(
        products
      )
    );

  }


  /* =========================================================
     LOCAL CALCULATOR
  ========================================================= */

  function loadCalculatorLocal() {

    try {

      const data =
        JSON.parse(
          localStorage.getItem(
            LS.calculator
          ) || "[]"
        );

      return Array.isArray(data)
        ? data
        : [];

    } catch {

      return [];

    }

  }


  function saveCalculatorLocal() {

    localStorage.setItem(
      LS.calculator,
      JSON.stringify(
        calculatorItems
      )
    );

  }


  /* =========================================================
     LOCAL ARCHIVE
  ========================================================= */

  function loadArchiveLocal() {

    try {

      const data =
        JSON.parse(
          localStorage.getItem(
            LS.archive
          ) || "[]"
        );

      return Array.isArray(data)
        ? data
        : [];

    } catch {

      return [];

    }

  }


  function saveArchiveLocal() {

    localStorage.setItem(
      LS.archive,
      JSON.stringify(
        archiveItems
      )
    );

  }


  /* =========================================================
     SUPABASE USER
  ========================================================= */

  async function getCurrentUser() {

    if (!supabaseClient) {
      return null;
    }


    try {

      const {
        data
      } =
        await supabaseClient
          .auth
          .getUser();


      return data?.user || null;

    } catch {

      return null;

    }

  }


  /* =========================================================
     SUPABASE LOAD
  ========================================================= */

  async function loadProductsFromSupabase() {

    if (!supabaseClient) {
      return [];
    }


    const user =
      await getCurrentUser();


    let query =
      supabaseClient
        .from("products")
        .select(
          "id,name,unit,kcal,protein,fat,carbs,sugars,salt,full_name,barcode,created_at"
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (user) {

      query =
        query.eq(
          "owner_id",
          user.id
        );

    }


    const {
      data,
      error
    } =
      await query;


    if (error) {

      /*
       * Сумісність зі старою схемою
       * Supabase без sugars/salt.
       */

      console.error(
        "Products load error:",
        error
      );


      let fallback =
        supabaseClient
          .from("products")
          .select(
            "id,name,unit,kcal,protein,fat,carbs,full_name,barcode,created_at"
          )
          .order(
            "created_at",
            {
              ascending: true
            }
          );


      if (user) {

        fallback =
          fallback.eq(
            "owner_id",
            user.id
          );

      }


      const fallbackResult =
        await fallback;


      if (fallbackResult.error) {

        console.error(
          fallbackResult.error
        );

        return null;

      }


      return (
        fallbackResult.data || []
      ).map(
        normalizeProduct
      );

    }


    return (
      data || []
    ).map(
      normalizeProduct
    );

  }


  /* =========================================================
     SUPABASE MERGE
  ========================================================= */

  function mergeProducts(
    local,
    cloud
  ) {

    const result =
      [...local];


    const byId =
      new Map(
        result.map(
          product =>
            [
              String(product.id),
              product
            ]
        )
      );


    const byName =
      new Map(
        result.map(
          product =>
            [
              product.name
                .toLowerCase(),
              product
            ]
        )
      );


    cloud.forEach(
      cloudProduct => {

        const product =
          normalizeProduct(
            cloudProduct
          );


        const existing =
          byId.get(
            String(
              product.id
            )
          ) ||
          byName.get(
            product.name
              .toLowerCase()
          );


        if (existing) {

          Object.assign(
            existing,
            product
          );

        } else {

          result.push(
            product
          );

        }

      }
    );


    return result;

  }


  /* =========================================================
     SUPABASE SAVE
  ========================================================= */

  async function saveProductToSupabase(
    product
  ) {

    if (!supabaseClient) {
      return;
    }


    const user =
      await getCurrentUser();


    if (!user) {
      return;
    }


    const payload = {

      name:
        product.name,

      unit:
        product.unit,

      kcal:
        product.kcal,

      protein:
        product.protein,

      fat:
        product.fat,

      carbs:
        product.carb,

      sugars:
        product.sugars,

      salt:
        product.salt,

      full_name:
        product.full_name || null,

      barcode:
        product.barcode || null,

      owner_id:
        user.id

    };


    if (
      Number.isInteger(
        Number(product.id)
      )
    ) {

      payload.id =
        Number(product.id);

    }


    const {
      error
    } =
      await supabaseClient
        .from("products")
        .upsert(
          payload,
          {
            onConflict: "id"
          }
        );


    if (error) {

      console.error(
        "Product save error:",
        error
      );

    }

  }


  /* =========================================================
     SUPABASE DELETE
  ========================================================= */

  async function deleteProductFromSupabase(
    product
  ) {

    if (
      !supabaseClient ||
      !Number.isInteger(
        Number(product.id)
      )
    ) {
      return;
    }


    const user =
      await getCurrentUser();


    let query =
      supabaseClient
        .from("products")
        .delete()
        .eq(
          "id",
          Number(product.id)
        );


    if (user) {

      query =
        query.eq(
          "owner_id",
          user.id
        );

    }


    const {
      error
    } =
      await query;


    if (error) {

      console.error(
        "Product delete error:",
        error
      );

    }

  }


  /* =========================================================
     SUPABASE SYNC
  ========================================================= */

  async function syncProductsToSupabase() {

    if (!supabaseClient) {
      return;
    }


    const user =
      await getCurrentUser();


    if (!user) {
      return;
    }


    for (
      const product
      of products
    ) {

      await saveProductToSupabase(
        product
      );

    }

  }


  /* =========================================================
     RENDER PRODUCTS
  ========================================================= */

  function renderProducts(
    filter = ""
  ) {

    const query =
      String(filter)
        .toLowerCase()
        .trim();


    grid.innerHTML = "";


    const filtered =
      products.filter(
        product => {

          const text =
            `
              ${product.name}
              ${product.full_name}
              ${product.barcode || ""}
            `
              .toLowerCase();


          return text.includes(
            query
          );

        }
      );


    if (!filtered.length) {

      grid.innerHTML = `
        <div class="stats-empty">
          Продуктів не знайдено.
        </div>
      `;

      return;

    }


    filtered.forEach(
      product => {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "food-card";


        card.draggable =
          reorderMode;


        card.dataset.id =
          String(product.id);


        card.innerHTML = `

          <div
            class="copy-btn"
            title="Ввести вагу"
          >

            <span>
              ↗
            </span>

            <span class="tooltip">
              Введіть вагу
            </span>

          </div>


          <div class="food-title">

            <div class="badge">
              ${escapeHTML(
                getInitials(
                  product.name
                )
              )}
            </div>

            <div>

              <div class="name">
                ${escapeHTML(
                  product.name
                )}
              </div>

              <div class="meta">
                100 ${escapeHTML(
                  product.unit
                )}
              </div>

            </div>

          </div>


          <div class="kbjv">

            <div class="row">
              <div class="key">
                Калорії
              </div>
              <div class="val">
                ${formatNumber(
                  product.kcal,
                  0
                )} ккал
              </div>
            </div>


            <div class="row">
              <div class="key">
                Білки
              </div>
              <div class="val">
                ${formatNumber(
                  product.protein
                )} г
              </div>
            </div>


            <div class="row">
              <div class="key">
                Жири
              </div>
              <div class="val">
                ${formatNumber(
                  product.fat
                )} г
              </div>
            </div>


            <div class="row">
              <div class="key">
                Вуглеводи
              </div>
              <div class="val">
                ${formatNumber(
                  product.carb
                )} г
              </div>
            </div>


            <div class="row">
              <div class="key">
                Цукри
              </div>
              <div class="val">
                ${formatNumber(
                  product.sugars
                )} г
              </div>
            </div>


            <div class="row">
              <div class="key">
                Сіль
              </div>
              <div class="val">
                ${formatNumber(
                  product.salt,
                  2
                )} г
              </div>
            </div>

          </div>


          ${
            product.full_name
              ? `
                <div class="full-name">
                  ${escapeHTML(
                    product.full_name
                  )}
                </div>
              `
              : ""
          }


          <div class="card-actions">

            <button
              class="card-edit"
            >
              Редагувати
            </button>

          </div>

        `;


        card
          .querySelector(
            ".copy-btn"
          )
          .addEventListener(
            "click",
            event => {

              event.stopPropagation();

              openProductModal(
                product
              );

            }
          );


        card
          .querySelector(
            ".card-edit"
          )
          .addEventListener(
            "click",
            event => {

              event.stopPropagation();

              openEditProduct(
                product
              );

            }
          );


        card.addEventListener(
          "click",
          () => {

            if (!reorderMode) {

              openProductModal(
                product
              );

            }

          }
        );


        /* DRAG START */

        card.addEventListener(
          "dragstart",
          () => {

            draggedCard =
              card;

            card.classList.add(
              "dragging"
            );

          }
        );


        card.addEventListener(
          "dragend",
          () => {

            draggedCard =
              null;

            card.classList.remove(
              "dragging"
            );

            document
              .querySelectorAll(
                ".drag-over"
              )
              .forEach(
                element =>
                  element.classList.remove(
                    "drag-over"
                  )
              );

          }
        );


        card.addEventListener(
          "dragover",
          event => {

            if (!reorderMode) {
              return;
            }

            event.preventDefault();

            if (
              card !==
              draggedCard
            ) {

              card.classList.add(
                "drag-over"
              );

            }

          }
        );


        card.addEventListener(
          "dragleave",
          () => {

            card.classList.remove(
              "drag-over"
            );

          }
        );


        card.addEventListener(
          "drop",
          event => {

            if (
              !reorderMode ||
              !draggedCard ||
              card === draggedCard
            ) {
              return;
            }


            event.preventDefault();


            card.classList.remove(
              "drag-over"
            );


            const from =
              products.findIndex(
                product =>
                  String(
                    product.id
                  ) ===
                  draggedCard.dataset.id
              );


            const to =
              products.findIndex(
                product =>
                  String(
                    product.id
                  ) ===
                  card.dataset.id
              );


            if (
              from < 0 ||
              to < 0
            ) {
              return;
            }


            const [
              moved
            ] =
              products.splice(
                from,
                1
              );


            products.splice(
              to,
              0,
              moved
            );


            reorderChanged =
              true;


            saveProductsLocal();


            renderProducts(
              searchInput.value
            );

          }
        );


        grid.appendChild(
          card
        );

      }
    );

  }


  /* =========================================================
     PRODUCT FORM
  ========================================================= */

  function fillProductForm(
    product = null
  ) {

    $("new-product-name").value =
      product?.name || "";


    $("new-product-unit").value =
      product?.unit || "г";


    $("new-product-kcal").value =
      product?.kcal ?? "";


    $("new-product-protein").value =
      product?.protein ?? "";


    $("new-product-fat").value =
      product?.fat ?? "";


    $("new-product-carb").value =
      product?.carb ?? "";


    $("new-product-sugars").value =
      product?.sugars ?? "";


    $("new-product-salt").value =
      product?.salt ?? "";


    $("new-product-description").value =
      product?.full_name ?? "";

  }


  function openAddProduct() {

    editingProductId =
      null;


    $("product-form-title")
      .textContent =
      "Додати продукт";


    fillProductForm();


    addProductModal
      .classList.add(
        "active"
      );


    $("new-product-name")
      .focus();

  }


  function openEditProduct(
    product
  ) {

    editingProductId =
      product.id;


    $("product-form-title")
      .textContent =
      "Редагувати продукт";


    fillProductForm(
      product
    );


    addProductModal
      .classList.add(
        "active"
      );


    $("new-product-name")
      .focus();

  }


  function closeAddModal() {

    addProductModal
      .classList.remove(
        "active"
      );


    editingProductId =
      null;

  }


  function readProductForm() {

    const name =
      $("new-product-name")
        .value
        .trim();


    if (!name) {

      showButtonState(
        $("add-product-save"),
        "Введіть назву",
        "error",
        "Зберегти"
      );

      return null;

    }


    return {

      name,

      unit:
        $("new-product-unit")
          .value,

      kcal:
        number(
          $("new-product-kcal")
            .value
        ),

      protein:
        number(
          $("new-product-protein")
            .value
        ),

      fat:
        number(
          $("new-product-fat")
            .value
        ),

      carb:
        number(
          $("new-product-carb")
            .value
        ),

      sugars:
        number(
          $("new-product-sugars")
            .value
        ),

      salt:
        number(
          $("new-product-salt")
            .value
        ),

      full_name:
        $("new-product-description")
          .value
          .trim()

    };

  }


  $("add-product")
    .addEventListener(
      "click",
      openAddProduct
    );


  $("add-product-cancel")
    .addEventListener(
      "click",
      () => {

        closeAddModal();

        showButtonState(
          $("add-product-cancel"),
          "Скасовано",
          "error",
          "Скасувати"
        );

      }
    );


  $("add-product-save")
    .addEventListener(
      "click",
      async () => {

        const data =
          readProductForm();


        if (!data) {
          return;
        }


        /* EDIT */

        if (
          editingProductId !==
          null &&
          editingProductId !==
          undefined
        ) {

          const product =
            products.find(
              item =>
                String(
                  item.id
                ) ===
                String(
                  editingProductId
                )
            );


          if (!product) {
            return;
          }


          const oldName =
            product.name;


          Object.assign(
            product,
            data
          );


          saveProductsLocal();


          renderProducts(
            searchInput.value
          );


          closeAddModal();


          logConsole(
            "Відредаговано продукт",
            `${oldName} → ${product.name}`
          );


          await saveProductToSupabase(
            product
          );


          showButtonState(
            $("add-product"),
            "Продукт змінено ✓",
            "success",
            "Додати продукт"
          );


          return;

        }


        /* ADD */

        const product =
          normalizeProduct({

            ...data,

            id:
              createId()

          });


        products.push(
          product
        );


        saveProductsLocal();


        renderProducts(
          searchInput.value
        );


        closeAddModal();


        logConsole(
          "Додано продукт",
          product.name
        );


        await saveProductToSupabase(
          product
        );


        showButtonState(
          $("add-product"),
          "Продукт додано ✓",
          "success",
          "Додати продукт"
        );

      }
    );


  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  function renderDeleteList() {

    const box =
      $("delete-product-list");


    box.innerHTML = "";


    if (!products.length) {

      box.innerHTML = `
        <div class="stats-empty">
          База продуктів порожня.
        </div>
      `;

      return;

    }


    products.forEach(
      product => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "delete-product-item";


        row.innerHTML = `

          <span class="delete-product-item-name">
            ${escapeHTML(
              product.name
            )}
          </span>

          <button
            class="delete-product-item-button"
          >
            Видалити
          </button>

        `;


        row
          .querySelector(
            "button"
          )
          .addEventListener(
            "click",
            async () => {

              if (
                !confirm(
                  `Видалити «${product.name}»?`
                )
              ) {
                return;
              }


              products =
                products.filter(
                  item =>
                    String(
                      item.id
                    ) !==
                    String(
                      product.id
                    )
                );


              saveProductsLocal();


              renderProducts(
                searchInput.value
              );


              await deleteProductFromSupabase(
                product
              );


              logConsole(
                "Видалено продукт",
                product.name
              );


              renderDeleteList();

            }
          );


        box.appendChild(
          row
        );

      }
    );

  }


  function openDeleteModal() {

    renderDeleteList();

    deleteProductModal
      .classList.add(
        "active"
      );

  }


  $("delete-product")
    .addEventListener(
      "click",
      openDeleteModal
    );


  $("delete-product-cancel-top")
    .addEventListener(
      "click",
      () => {

        deleteProductModal
          .classList.remove(
            "active"
          );

      }
    );


  $("delete-product-cancel-bottom")
    .addEventListener(
      "click",
      () => {

        deleteProductModal
          .classList.remove(
            "active"
          );

      }
    );


  /* =========================================================
     REORDER
  ========================================================= */

  $("reorder-products")
    .addEventListener(
      "click",
      () => {

        reorderMode =
          !reorderMode;


        $("reorder-products")
          .classList.toggle(
            "reorder-active",
            reorderMode
          );


        $("reorder-products")
          .textContent =
          reorderMode
            ? "Завершити зміну розташування"
            : "Змінити розташування продукту";


        grid.classList.toggle(
          "reorder-mode",
          reorderMode
        );


        if (
          !reorderMode &&
          reorderChanged
        ) {

          logConsole(
            "Змінено розташування продуктів"
          );


          reorderChanged =
            false;

        }


        renderProducts(
          searchInput.value
        );

      }
    );


  /* =========================================================
     PRODUCT MODAL
  ========================================================= */

  function productSummary(
    product,
    weight
  ) {

    const multiplier =
      weight / 100;


    return `
${product.name}, для ${formatNumber(weight, 1)} ${product.unit} - ${formatNumber(product.kcal * multiplier, 0)} ккал / ${formatNumber(product.protein * multiplier)} білка / ${formatNumber(product.fat * multiplier)} жирів / ${formatNumber(product.carb * multiplier)} вуглеводів / ${formatNumber(product.sugars * multiplier)} цукрів / ${formatNumber(product.salt * multiplier, 2)} солі
`.trim();

  }


  function openProductModal(
    product
  ) {

    selectedProduct =
      product;


    $("product-modal-name")
      .textContent =
      product.name;


    $("product-weight")
      .value =
      100;


    productModal
      .classList.add(
        "active"
      );


    $("product-weight")
      .focus();


    $("product-weight")
      .select();

  }


  function closeProductModal() {

    productModal
      .classList.remove(
        "active"
      );


    selectedProduct =
      null;

  }


  $("product-cancel")
    .addEventListener(
      "click",
      () => {

        closeProductModal();

        showButtonState(
          $("product-cancel"),
          "Скасовано",
          "error",
          "Скасувати"
        );

      }
    );


  $("product-copy")
    .addEventListener(
      "click",
      async () => {

        if (!selectedProduct) {
          return;
        }


        const weight =
          number(
            $("product-weight")
              .value
          );


        if (weight <= 0) {
          return;
        }


        try {

          await navigator
            .clipboard
            .writeText(
              productSummary(
                selectedProduct,
                weight
              )
            );


          showButtonState(
            $("product-copy"),
            "Скопійовано ✓",
            "success",
            "Скопіювати"
          );


          setTimeout(
            closeProductModal,
            450
          );

        } catch {

          showButtonState(
            $("product-copy"),
            "Помилка",
            "error",
            "Скопіювати"
          );

        }

      }
    );


  $("product-calculator")
    .addEventListener(
      "click",
      () => {

        if (!selectedProduct) {
          return;
        }


        const weight =
          number(
            $("product-weight")
              .value
          );


        if (weight <= 0) {
          return;
        }


        const input =
          $("calc-input");


        const text =
          productSummary(
            selectedProduct,
            weight
          );


        input.value =
          input.value.trim()
            ? `${input.value.replace(/\s+$/, "")}\n${text}`
            : text;


        saveCalculatorDraft();


        closeProductModal();


        activateTab(
          "calculator"
        );


        input.focus();


        input.scrollTop =
          input.scrollHeight;

      }
    );


  /* =========================================================
     SEARCH
  ========================================================= */

  searchInput
    .addEventListener(
      "input",
      () => {

        clearSearch.style.display =
          searchInput.value.trim()
            ? "inline"
            : "none";


        renderProducts(
          searchInput.value
        );

      }
    );


  clearSearch
    .addEventListener(
      "click",
      () => {

        searchInput.value =
          "";


        clearSearch.style.display =
          "none";


        renderProducts();


        searchInput.focus();

      }
    );


  /* =========================================================
     CALCULATOR DRAFT
  ========================================================= */

  function saveCalculatorDraft() {

    localStorage.setItem(
      LS.draft,
      $("calc-input").value
    );

  }


  function loadCalculatorDraft() {

    const value =
      localStorage.getItem(
        LS.draft
      );


    if (value !== null) {

      $("calc-input")
        .value =
        value;

    }

  }


  $("calc-input")
    .addEventListener(
      "input",
      saveCalculatorDraft
    );


  /* =========================================================
     CALCULATOR PARSER
  ========================================================= */

  function parseCalculatorLine(
    line
  ) {

    const standard =
      line.match(
        /^(.*?)\s*,\s*для\s*([\d.,]+)\s*(г|гр|грам|мл)\s*-\s*([\d.,]+)\s*ккал\s*\/\s*([\d.,]+)\s*білка\s*\/\s*([\d.,]+)\s*жирів\s*\/\s*([\d.,]+)\s*вуглеводів(?:\s*\/\s*([\d.,]+)\s*цукрів)?(?:\s*\/\s*([\d.,]+)\s*солі)?/i
      );


    if (standard) {

      const parse =
        value =>
          number(
            String(value)
              .replace(
                ",",
                "."
              )
          );


      return {

        text:
          line,

        kcal:
          parse(
            standard[4]
          ),

        protein:
          parse(
            standard[5]
          ),

        fat:
          parse(
            standard[6]
          ),

        carb:
          parse(
            standard[7]
          ),

        sugars:
          parse(
            standard[8]
          ),

        salt:
          parse(
            standard[9]
          )

      };

    }


    const kcal =
      line.match(
        /([+\-]?\s*\d+(?:[.,]\d+)?)\s*(?:ккал|калорій)/i
      );


    if (kcal) {

      return {

        text:
          line,

        kcal:
          number(
            kcal[1]
              .replace(
                /\s/g,
                ""
              )
              .replace(
                ",",
                "."
              )
          ),

        protein: 0,
        fat: 0,
        carb: 0,
        sugars: 0,
        salt: 0

      };

    }


    return {

      text:
        line,

      kcal: 0,
      protein: 0,
      fat: 0,
      carb: 0,
      sugars: 0,
      salt: 0

    };

  }


  /* =========================================================
     CALCULATOR TOTALS
  ========================================================= */

  function updateTotals() {

    const totals =
      calculatorItems.reduce(
        (result, item) => {

          result.kcal +=
            number(
              item.kcal
            );

          result.protein +=
            number(
              item.protein
            );

          result.fat +=
            number(
              item.fat
            );

          result.carb +=
            number(
              item.carb ??
              item.carbs
            );

          result.sugars +=
            number(
              item.sugars
            );

          result.salt +=
            number(
              item.salt
            );

          return result;

        },
        {
          kcal: 0,
          protein: 0,
          fat: 0,
          carb: 0,
          sugars: 0,
          salt: 0
        }
      );


    $("kcal")
      .textContent =
      formatNumber(
        totals.kcal,
        0
      );


    $("protein")
      .textContent =
      formatNumber(
        totals.protein
      );


    $("fat")
      .textContent =
      formatNumber(
        totals.fat
      );


    $("carb")
      .textContent =
      formatNumber(
        totals.carb
      );


    $("sugars")
      .textContent =
      formatNumber(
        totals.sugars
      );


    $("salt")
      .textContent =
      formatNumber(
        totals.salt,
        2
      );


    return totals;

  }


  function renderCalculatorLog() {

    const box =
      $("calc-log");


    box.innerHTML =
      calculatorItems
        .map(
          (item, index) => `

            <div class="log-item">

              <span>
                ${escapeHTML(
                  item.text
                )}
              </span>

              <button
                class="remove"
                data-index="${index}"
              >
                Відняти
              </button>

            </div>

          `
        )
        .join("");


    updateTotals();

  }


  $("calc-log")
    .addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            ".remove"
          );


        if (!button) {
          return;
        }


        calculatorItems.splice(
          Number(
            button.dataset.index
          ),
          1
        );


        saveCalculatorLocal();


        renderCalculatorLog();

      }
    );


  $("calc-add")
    .addEventListener(
      "click",
      () => {

        const lines =
          $("calc-input")
            .value
            .split("\n")
            .map(
              line =>
                line.trim()
            )
            .filter(Boolean);


        if (!lines.length) {

          showButtonState(
            $("calc-add"),
            "Немає даних ✕",
            "error",
            "Додати"
          );

          return;

        }


        calculatorItems.push(
          ...lines.map(
            parseCalculatorLine
          )
        );


        saveCalculatorLocal();


        $("calc-input")
          .value =
          "";


        localStorage.removeItem(
          LS.draft
        );


        renderCalculatorLog();


        showButtonState(
          $("calc-add"),
          "Додано ✓",
          "success",
          "Додати"
        );

      }
    );


  $("calc-clear-text")
    .addEventListener(
      "click",
      () => {

        $("calc-input")
          .value =
          "";


        localStorage.removeItem(
          LS.draft
        );


        showButtonState(
          $("calc-clear-text"),
          "Очищено ✓",
          "success",
          "Очистити текст"
        );

      }
    );


  $("calc-clear-blocks")
    .addEventListener(
      "click",
      () => {

        if (!calculatorItems.length) {

          showButtonState(
            $("calc-clear-blocks"),
            "Немає даних ✕",
            "error",
            "Очистити блоки"
          );

          return;

        }


        if (
          !confirm(
            "Очистити всі блоки калькулятора?"
          )
        ) {
          return;
        }


        calculatorItems =
          [];


        saveCalculatorLocal();


        renderCalculatorLog();


        showButtonState(
          $("calc-clear-blocks"),
          "Очищено ✓",
          "success",
          "Очистити блоки"
        );

      }
    );


  $("calc-section")
    .addEventListener(
      "click",
      () => {

        calculatorItems.push({

          text:
            "/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/",

          kcal: 0,
          protein: 0,
          fat: 0,
          carb: 0,
          sugars: 0,
          salt: 0

        });


        saveCalculatorLocal();


        renderCalculatorLog();


        showButtonState(
          $("calc-section"),
          "Додано ✓",
          "success",
          "Розділ"
        );

      }
    );


  $("copy-total")
    .addEventListener(
      "click",
      async () => {

        const totals =
          updateTotals();


        const text =
          `Денний підсумок: ${formatNumber(totals.kcal, 0)} ккал / ${formatNumber(totals.protein)} білка / ${formatNumber(totals.fat)} жирів / ${formatNumber(totals.carb)} вуглеводів / ${formatNumber(totals.sugars)} цукрів / ${formatNumber(totals.salt, 2)} солі`;


        try {

          await navigator
            .clipboard
            .writeText(
              text
            );


          showButtonState(
            $("copy-total"),
            "Скопійовано ✓",
            "success",
            "Скопіювати підсумок"
          );

        } catch {

          showButtonState(
            $("copy-total"),
            "Помилка",
            "error",
            "Скопіювати підсумок"
          );

        }

      }
    );


  /* =========================================================
     ARCHIVE HELPERS
  ========================================================= */

  function today() {

    const date =
      new Date();


    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  }


  function dateFormat(
    value
  ) {

    if (!value) {
      return "";
    }


    const parts =
      value.split("-");


    if (
      parts.length !== 3
    ) {
      return value;
    }


    return `
      ${parts[2]}.
      ${parts[1]}.
      ${parts[0]}
    `.replace(
      /\s/g,
      ""
    );

  }


  function archiveSummary(
    date,
    totals
  ) {

    return `
      Денний підсумок за ${dateFormat(date)} - ${formatNumber(totals.kcal, 0)} ккал / ${formatNumber(totals.protein)} білка / ${formatNumber(totals.fat)} жирів / ${formatNumber(totals.carb)} вуглеводів / ${formatNumber(totals.sugars)} цукрів / ${formatNumber(totals.salt, 2)} солі
    `.trim();

  }


  function parseArchiveSummary(
    text
  ) {

    const get =
      regex => {

        const match =
          text.match(
            regex
          );


        return match
          ? number(
              match[1]
                .replace(
                  ",",
                  "."
                )
            )
          : 0;

      };


    return {

      kcal:
        get(
          /([\d.,]+)\s*ккал/i
        ),

      protein:
        get(
          /([\d.,]+)\s*білка/i
        ),

      fat:
        get(
          /([\d.,]+)\s*жирів/i
        ),

      carb:
        get(
          /([\d.,]+)\s*вуглеводів/i
        ),

      sugars:
        get(
          /([\d.,]+)\s*цукрів/i
        ),

      salt:
        get(
          /([\d.,]+)\s*солі/i
        )

    };

  }


  /* =========================================================
     ARCHIVE RENDER
  ========================================================= */

  function renderArchive() {

    const box =
      $("archive-log");


    box.innerHTML =
      "";


    archiveItems.forEach(
      (item, index) => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "log-item archive-item";


        row.innerHTML = `

          <div class="archive-content">

            <span>
              ${escapeHTML(
                item.text
              )}
            </span>

          </div>


          <div class="archive-actions">

            <button
              class="edit-date"
            >
              Дата
            </button>

            <button
              class="edit-text"
            >
              Текст
            </button>

            <button
              class="remove"
            >
              Видалити
            </button>

          </div>

        `;


        const content =
          row.querySelector(
            ".archive-content span"
          );


        const actions =
          row.querySelector(
            ".archive-actions"
          );


        const dateButton =
          row.querySelector(
            ".edit-date"
          );


        const textButton =
          row.querySelector(
            ".edit-text"
          );


        dateButton
          .addEventListener(
            "click",
            () => {

              const input =
                document.createElement(
                  "input"
                );


              input.type =
                "date";


              input.className =
                "archive-date-input";


              input.value =
                item.date ||
                today();


              actions.insertBefore(
                input,
                dateButton
              );


              dateButton.textContent =
                "Підтвердити";


              const finish =
                () => {

                  const newDate =
                    input.value;


                  if (
                    newDate &&
                    newDate !==
                      item.date
                  ) {

                    const oldDate =
                      item.date;


                    item.date =
                      newDate;


                    item.text =
                      item.text.replace(
                        /Денний підсумок за\s+\d{2}\.\d{2}\.\d{4}/,
                        `Денний підсумок за ${dateFormat(newDate)}`
                      );


                    saveArchiveLocal();


                    logConsole(
                      "Змінено дату архіву",
                      `${oldDate} → ${newDate}`
                    );


                    renderArchive();


                    renderStatistics();

                  } else {

                    input.remove();

                    dateButton.textContent =
                      "Дата";

                  }

                };


              input.addEventListener(
                "change",
                finish
              );


              input.addEventListener(
                "blur",
                () => {

                  setTimeout(
                    () => {

                      if (
                        document.body.contains(
                          input
                        )
                      ) {
                        finish();
                      }

                    },
                    200
                  );

                }
              );


              input.focus();


              try {

                input.showPicker();

              } catch {}

            }
          );


        textButton
          .addEventListener(
            "click",
            () => {

              openArchiveTextEdit(
                item,
                textButton
              );

            }
          );


        row
          .querySelector(
            ".remove"
          )
          .addEventListener(
            "click",
            () => {

              if (
                !confirm(
                  "Ви точно хочете видалити цей денний підсумок?"
                )
              ) {
                return;
              }


              archiveItems.splice(
                index,
                1
              );


              saveArchiveLocal();


              logConsole(
                "Видалено запис з архіву",
                item.date || ""
              );


              renderArchive();


              renderStatistics();

            }
          );


        box.appendChild(
          row
        );

      }
    );

  }


  /* =========================================================
     ARCHIVE TEXT EDIT
  ========================================================= */

  function openArchiveTextEdit(
    item,
    button
  ) {

    archiveEditingId =
      item.id;


    archiveOriginalText =
      item.text;


    $("archive-text-input")
      .value =
      item.text;


    $("archive-text-input")
      ._archiveButton =
      button;


    archiveTextModal
      .classList.add(
        "active"
      );


    $("archive-text-input")
      .focus();

  }


  $("archive-text-cancel")
    .addEventListener(
      "click",
      () => {

        archiveTextModal
          .classList.remove(
            "active"
          );


        archiveEditingId =
          null;


        archiveOriginalText =
          null;

      }
    );


  $("archive-text-save")
    .addEventListener(
      "click",
      () => {

        const item =
          archiveItems.find(
            archiveItem =>
              archiveItem.id ===
              archiveEditingId
          );


        if (!item) {
          return;
        }


        const newText =
          $("archive-text-input")
            .value
            .trim();


        if (!newText) {
          return;
        }


        if (
          newText !==
          archiveOriginalText
        ) {

          item.text =
            newText;


          saveArchiveLocal();


          logConsole(
            "Відредаговано запис архіву",
            item.date || ""
          );


          renderArchive();


          renderStatistics();

        }


        archiveTextModal
          .classList.remove(
            "active"
          );


        archiveEditingId =
          null;


        archiveOriginalText =
          null;

      }
    );


  /* =========================================================
     SAVE ARCHIVE
  ========================================================= */

  $("save-archive")
    .addEventListener(
      "click",
      () => {

        const totals =
          updateTotals();


        if (
          !calculatorItems.length
        ) {

          showButtonState(
            $("save-archive"),
            "Немає даних ✕",
            "error",
            "Зберегти в архів"
          );

          return;

        }


        const date =
          today();


        archiveItems.unshift({

          id:
            createId(),

          date,

          text:
            archiveSummary(
              date,
              totals
            ),

          created_at:
            now()

        });


        saveArchiveLocal();


        renderArchive();


        renderStatistics();


        showButtonState(
          $("save-archive"),
          "Збережено ✓",
          "success",
          "Зберегти в архів"
        );

      }
    );


  /* =========================================================
     STATISTICS DEFAULT RANGE
  ========================================================= */

  function setDefaultStatisticsDates() {

    const end =
      today();


    const startDate =
      new Date();


    startDate.setDate(
      startDate.getDate() - 6
    );


    const start =
      `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-${String(
        startDate.getDate()
      ).padStart(2, "0")}`;


    $("stats-from")
      .value =
      start;


    $("stats-to")
      .value =
      end;

  }


  /* =========================================================
     STATISTICS DATA
  ========================================================= */

  function getStatisticsData() {

    let from =
      $("stats-from")
        .value;


    let to =
      $("stats-to")
        .value;


    if (
      !from ||
      !to
    ) {
      return [];
    }


    if (from > to) {

      [
        from,
        to
      ] =
        [
          to,
          from
        ];

    }


    const map =
      new Map();


    archiveItems.forEach(
      item => {

        const date =
          item.date ||
          today();


        /*
         * Якщо в один день є кілька
         * записів, вони сумуються.
         */

        const current =
          map.get(date) ||
          {
            kcal: 0,
            protein: 0,
            fat: 0,
            carb: 0,
            sugars: 0,
            salt: 0
          };


        const parsed =
          parseArchiveSummary(
            item.text
          );


        current.kcal +=
          parsed.kcal;

        current.protein +=
          parsed.protein;

        current.fat +=
          parsed.fat;

        current.carb +=
          parsed.carb;

        current.sugars +=
          parsed.sugars;

        current.salt +=
          parsed.salt;


        map.set(
          date,
          current
        );

      }
    );


    const result = [];


    const currentDate =
      new Date(
        `${from}T12:00:00`
      );


    const endDate =
      new Date(
        `${to}T12:00:00`
      );


    while (
      currentDate <=
      endDate
    ) {

      const date =
        `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(
          currentDate.getDate()
        ).padStart(2, "0")}`;


      result.push({

        date,

        ...(map.get(
          date
        ) || {

          kcal: 0,
          protein: 0,
          fat: 0,
          carb: 0,
          sugars: 0,
          salt: 0

        })

      });


      currentDate.setDate(
        currentDate.getDate() + 1
      );


      /*
       * Безпечне обмеження.
       */

      if (
        result.length >
        370
      ) {
        break;
      }

    }


    return result;

  }


  /* =========================================================
     DRAW STATISTICS CHART
  ========================================================= */

  function drawStatisticsChart(
    data,
    metric
  ) {

    const canvas =
      $("stats-chart");


    const context =
      canvas.getContext(
        "2d"
      );


    const rect =
      canvas.getBoundingClientRect();


    const ratio =
      window.devicePixelRatio ||
      1;


    const width =
      Math.max(
        300,
        rect.width
      );


    const height =
      Math.max(
        220,
        rect.height
      );


    canvas.width =
      width * ratio;


    canvas.height =
      height * ratio;


    context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );


    context.clearRect(
      0,
      0,
      width,
      height
    );


    if (!data.length) {

      $("stats-empty")
        .textContent =
        "Оберіть період.";

      return;

    }


    $("stats-empty")
      .textContent =
      "";


    const padding = {

      left: 52,
      right: 18,
      top: 22,
      bottom: 42

    };


    const plotWidth =
      width -
      padding.left -
      padding.right;


    const plotHeight =
      height -
      padding.top -
      padding.bottom;


    const values =
      data.map(
        item =>
          number(
            item[metric]
          )
      );


    const maxValue =
      Math.max(
        ...values,
        1
      );


    const minValue =
      Math.min(
        ...values,
        0
      );


    const range =
      maxValue -
      minValue ||
      1;


    /* GRID */

    context.strokeStyle =
      "#36393f";

    context.lineWidth =
      1;


    context.font =
      "11px Segoe UI";


    context.fillStyle =
      "#b9bbbe";


    for (
      let i = 0;
      i <= 4;
      i++
    ) {

      const y =
        padding.top +
        plotHeight *
          i /
          4;


      context.beginPath();

      context.moveTo(
        padding.left,
        y
      );

      context.lineTo(
        width -
          padding.right,
        y
      );

      context.stroke();


      const value =
        maxValue -
        range *
          i /
          4;


      context.fillText(
        formatNumber(
          value,
          metric === "salt"
            ? 2
            : 1
        ),
        5,
        y + 4
      );

    }


    /* POINTS */

    const points =
      data.map(
        (item, index) => {

          const x =
            data.length === 1

              ? padding.left +
                plotWidth / 2

              : padding.left +
                plotWidth *
                  index /
                  (data.length - 1);


          const y =
            padding.top +
            plotHeight -
            (
              number(
                item[metric]
              ) -
              minValue
            ) /
            range *
            plotHeight;


          return {
            x,
            y
          };

        }
      );


    /* LINE */

    context.strokeStyle =
      "#67a4b5";

    context.lineWidth =
      2;


    context.beginPath();


    points.forEach(
      (point, index) => {

        if (index === 0) {

          context.moveTo(
            point.x,
            point.y
          );

        } else {

          context.lineTo(
            point.x,
            point.y
          );

        }

      }
    );


    context.stroke();


    /* POINTS + VALUES */

    points.forEach(
      (point, index) => {

        context.fillStyle =
          "#67a4b5";


        context.beginPath();


        context.arc(
          point.x,
          point.y,
          3.5,
          0,
          Math.PI * 2
        );


        context.fill();


        context.fillStyle =
          "#dcddde";


        context.fillText(
          formatNumber(
            values[index],
            metric === "salt"
              ? 2
              : 1
          ),
          point.x - 10,
          point.y - 9
        );

      }
    );


    /* X AXIS DATES */

    context.fillStyle =
      "#b9bbbe";


    const step =
      Math.max(
        1,
        Math.ceil(
          data.length / 8
        )
      );


    data.forEach(
      (item, index) => {

        if (
          index % step !== 0 &&
          index !==
            data.length - 1
        ) {
          return;
        }


        const label =
          dateFormat(
            item.date
          ).slice(
            0,
            5
          );


        context.fillText(
          label,
          points[index].x - 16,
          height - 12
        );

      }
    );

  }


  function renderStatistics() {

    drawStatisticsChart(
      getStatisticsData(),
      activeStatsMetric
    );

  }


  document
    .querySelectorAll(
      ".stats-metric"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".stats-metric"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );


            button.classList.add(
              "active"
            );


            activeStatsMetric =
              button.dataset.metric;


            renderStatistics();

          }
        );

      }
    );


  $("stats-from")
    .addEventListener(
      "change",
      renderStatistics
    );


  $("stats-to")
    .addEventListener(
      "change",
      renderStatistics
    );


  window.addEventListener(
    "resize",
    () => {

      if (
        $("archive")
          .classList
          .contains("active")
      ) {

        renderStatistics();

      }

    }
  );


  /* =========================================================
     VERSION SYSTEM
  ========================================================= */

  function getExportVersion(
    snapshot,
    type
  ) {

    const versionKey =
      type === "products"
        ? LS.productVersion
        : LS.archiveVersion;


    const snapshotKey =
      type === "products"
        ? LS.productSnapshot
        : LS.archiveSnapshot;


    let version =
      number(
        localStorage.getItem(
          versionKey
        )
      );


    const previousSnapshot =
      localStorage.getItem(
        snapshotKey
      );


    /*
     * Перший експорт.
     */

    if (
      previousSnapshot ===
      null
    ) {

      version =
        1;

    }

    /*
     * Дані змінилися
     * після попереднього експорту.
     */

    else if (
      previousSnapshot !==
      snapshot
    ) {

      version =
        Math.max(
          1,
          version + 1
        );

    }


    localStorage.setItem(
      versionKey,
      String(version)
    );


    localStorage.setItem(
      snapshotKey,
      snapshot
    );


    return version;

  }


  /* =========================================================
     DOWNLOAD JSON
  ========================================================= */

  function downloadJSON(
    filename,
    data
  ) {

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      filename;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );

  }


  /* =========================================================
     EXPORT PRODUCTS
  ========================================================= */

  $("export-products")
    .addEventListener(
      "click",
      () => {

        const snapshot =
          getProductsSnapshot();


        const version =
          getExportVersion(
            snapshot,
            "products"
          );


        downloadJSON(
          `kbjv-database-version-${version}.json`,
          {

            version:
              `version-${version}`,

            exported_at:
              now(),

            products:
              products.map(
                normalizeProduct
              )

          }
        );


        logConsole(
          "Експорт бази",
          `version-${version}`
        );


        showButtonState(
          $("export-products"),
          `version-${version} ✓`,
          "success",
          "Експорт бази"
        );

      }
    );


  /* =========================================================
     IMPORT PRODUCTS
  ========================================================= */

  $("import-products")
    .addEventListener(
      "click",
      () =>
        $("import-file").click()
    );


  $("import-file")
    .addEventListener(
      "change",
      async event => {

        const file =
          event.target.files?.[0];


        if (!file) {
          return;
        }


        try {

          const data =
            JSON.parse(
              await file.text()
            );


          const importedProducts =
            Array.isArray(data)
              ? data
              : data.products;


          if (
            !Array.isArray(
              importedProducts
            )
          ) {

            throw new Error(
              "Файл не містить масиву products."
            );

          }


          if (
            !confirm(
              "Імпорт замінить поточну базу продуктів. Продовжити?"
            )
          ) {
            return;
          }


          products =
            importedProducts
              .map(
                normalizeProduct
              )
              .filter(
                product =>
                  product.name
              );


          saveProductsLocal();


          renderProducts(
            searchInput.value
          );


          await syncProductsToSupabase();


          logConsole(
            "Імпортовано базу",
            String(
              data.version ||
              "невідома версія"
            )
          );


          showButtonState(
            $("import-products"),
            "Імпортовано ✓",
            "success",
            "Імпорт бази"
          );

        } catch (error) {

          console.error(
            error
          );


          showButtonState(
            $("import-products"),
            "Помилка ✕",
            "error",
            "Імпорт бази"
          );

        } finally {

          event.target.value =
            "";

        }

      }
    );


  /* =========================================================
     ARCHIVE EXPORT
  ========================================================= */

  $("export-archive")
    .addEventListener(
      "click",
      () => {

        const snapshot =
          getArchiveSnapshot();


        const version =
          getExportVersion(
            snapshot,
            "archive"
          );


        downloadJSON(
          `kbjv-archive-version-${version}.json`,
          {

            version:
              `version-${version}`,

            type:
              "archive",

            exported_at:
              now(),

            archive:
              archiveItems

          }
        );


        logConsole(
          "Експорт архіву",
          `version-${version}`
        );


        showButtonState(
          $("export-archive"),
          `version-${version} ✓`,
          "success",
          "Експорт архіву"
        );

      }
    );


  /* =========================================================
     ARCHIVE IMPORT
  ========================================================= */

  $("import-archive")
    .addEventListener(
      "click",
      () =>
        $("archive-import-file").click()
    );


  $("archive-import-file")
    .addEventListener(
      "change",
      async event => {

        const file =
          event.target.files?.[0];


        if (!file) {
          return;
        }


        try {

          const data =
            JSON.parse(
              await file.text()
            );


          const importedArchive =
            Array.isArray(data)
              ? data
              : data.archive;


          if (
            !Array.isArray(
              importedArchive
            )
          ) {

            throw new Error(
              "Файл не містить масиву archive."
            );

          }


          if (
            !confirm(
              "Імпорт замінить поточний архів. Продовжити?"
            )
          ) {
            return;
          }


          archiveItems =
            importedArchive
              .map(
                item => ({

                  id:
                    item.id ||
                    createId(),

                  date:
                    item.date ||
                    today(),

                  text:
                    String(
                      item.text ||
                      ""
                    ),

                  created_at:
                    item.created_at ||
                    now()

                })
              )
              .filter(
                item =>
                  item.text
              );


          saveArchiveLocal();


          renderArchive();


          renderStatistics();


          logConsole(
            "Імпортовано архів",
            String(
              data.version ||
              "невідома версія"
            )
          );


          showButtonState(
            $("import-archive"),
            "Імпортовано ✓",
            "success",
            "Імпорт архіву"
          );

        } catch (error) {

          console.error(
            error
          );


          showButtonState(
            $("import-archive"),
            "Помилка ✕",
            "error",
            "Імпорт архіву"
          );

        } finally {

          event.target.value =
            "";

        }

      }
    );


  /* =========================================================
     TABS
  ========================================================= */

  function activateTab(
    name
  ) {

    tabs.forEach(
      tab => {

        tab.classList.toggle(
          "active",
          tab.dataset.tab ===
            name
        );

      }
    );


    pages.forEach(
      page => {

        page.classList.toggle(
          "active",
          page.id ===
            name
        );

      }
    );


    localStorage.setItem(
      LS.activeTab,
      name
    );


    if (
      name ===
      "archive"
    ) {

      renderStatistics();

    }


    if (
      name ===
      "console"
    ) {

      renderConsole();

    }

  }


  tabs.forEach(
    tab => {

      tab.addEventListener(
        "click",
        () =>
          activateTab(
            tab.dataset.tab
          )
      );

    }
  );


  /* =========================================================
     MODAL BACKDROP
  ========================================================= */

  [
    productModal,
    addProductModal,
    deleteProductModal,
    archiveTextModal

  ].forEach(
    modal => {

      modal?.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            modal
          ) {

            modal.classList.remove(
              "active"
            );

          }

        }
      );

    }
  );


  /* =========================================================
     ESCAPE
  ========================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Escape"
      ) {
        return;
      }


      [
        productModal,
        addProductModal,
        deleteProductModal,
        archiveTextModal

      ].forEach(
        modal =>
          modal?.classList.remove(
            "active"
          )
      );


      selectedProduct =
        null;


      editingProductId =
        null;


      archiveEditingId =
        null;


      archiveOriginalText =
        null;

    }
  );


  /* =========================================================
     ENTER — WEIGHT
  ========================================================= */

  $("product-weight")
    .addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          $("product-copy")
            .click();

        }

      }
    );


  /* =========================================================
     ENTER — PRODUCT FORM
  ========================================================= */

  [
    $("new-product-name"),
    $("new-product-kcal"),
    $("new-product-protein"),
    $("new-product-fat"),
    $("new-product-carb"),
    $("new-product-sugars"),
    $("new-product-salt")

  ].forEach(
    input => {

      input?.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();

            $("add-product-save")
              .click();

          }

        }
      );

    }
  );


  /* =========================================================
     INITIALIZATION
  ========================================================= */

  calculatorItems =
    loadCalculatorLocal();


  archiveItems =
    loadArchiveLocal();


  loadCalculatorDraft();


  renderCalculatorLog();


  renderArchive();


  renderConsole();


  setDefaultStatisticsDates();


  const savedTab =
    localStorage.getItem(
      LS.activeTab
    );


  activateTab(
    savedTab &&
    $(savedTab)
      ? savedTab
      : "blocks"
  );


  products =
    loadProductsLocal();


  renderProducts();


  /*
   * Завантажуємо актуальну базу
   * із Supabase.
   */

  const cloudProducts =
    await loadProductsFromSupabase();


  if (
    Array.isArray(
      cloudProducts
    ) &&
    cloudProducts.length
  ) {

    products =
      mergeProducts(
        products,
        cloudProducts
      );


    saveProductsLocal();


    renderProducts(
      searchInput.value
    );

  }


  /* =========================================================
     SUPABASE AUTH
  ========================================================= */

  if (supabaseClient) {

    supabaseClient
      .auth
      .onAuthStateChange(
        async (
          event,
          session
        ) => {

          console.log(
            "Supabase auth event:",
            event
          );


          if (
            event ===
              "SIGNED_IN" &&
            session?.user
          ) {

            const cloud =
              await loadProductsFromSupabase();


            if (
              Array.isArray(
                cloud
              ) &&
              cloud.length
            ) {

              products =
                mergeProducts(
                  products,
                  cloud
                );


              saveProductsLocal();


              renderProducts(
                searchInput.value
              );

            }

          }

        }
      );

  }

});